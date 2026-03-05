import { BadRequestException, Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { ShopsService } from '../shops.service';
import axios from 'axios';
import { createHmac, randomUUID } from 'crypto';
import { ShopReqDto } from '../dto/shop-req.dto';

type OAuthStatePayload = {
  userId: string;
  expiresAt: number;
};

@Injectable()
export class ShopeeService {
  private readonly oauthStateTtlMs = 10 * 60 * 1000;
  private readonly oauthStates = new Map<string, OAuthStatePayload>();

  constructor(
    private configService: ConfigService,
    private shopService: ShopsService,
  ) {}

  createAuthUrl(userId: string) {
    if (!userId) {
      throw new BadRequestException('User ID không hợp lệ');
    }

    const partnerId = this.configService.get<string>('SHOPEE_PARTNER_ID');
    const redirectUri = this.configService.get<string>('SHOPEE_REDIRECT_URI');

    if (!partnerId || !redirectUri) {
      throw new BadRequestException(
        'Thiếu cấu hình SHOPEE_PARTNER_ID hoặc SHOPEE_REDIRECT_URI',
      );
    }

    this.pruneExpiredStates();

    const state = randomUUID();
    this.oauthStates.set(state, {
      userId,
      expiresAt: Date.now() + this.oauthStateTtlMs,
    });

    const timestamp = Math.floor(Date.now() / 1000);
    const path = '/api/v2/shop/auth_partner';
    const sign = this.generateShopeeSign(path, timestamp);

    const query = new URLSearchParams({
      partner_id: partnerId,
      redirect: redirectUri,
      timestamp: timestamp.toString(),
      sign,
      state,
    });

    return {
      state,
      authUrl: `https://partner.shopeemobile.com${path}?${query.toString()}`,
    };
  }

  async handleCallback(code: string, shopId: string, state: string) {
    try {
      // Kiểm tra state để xác định userId và tránh CSRF
      const oauthState = this.oauthStates.get(state);
      if (!oauthState || oauthState.expiresAt < Date.now()) {
        throw new BadRequestException(
          'State OAuth không hợp lệ hoặc đã hết hạn',
        );
      }

      // Dọn dẹp state sau khi sử dụng
      this.oauthStates.delete(state);

      // 1. Tạo signature để đổi code lấy token
      const timestamp = Math.floor(Date.now() / 1000);
      const path = '/api/v2/auth/access_token/get';
      const sign = this.generateShopeeSign(path, timestamp);
      const partnerId = this.configService.get<string>('SHOPEE_PARTNER_ID');

      // 2. Đổi code lấy token
      const response = await axios.post(
        `https://partner.shopeemobile.com${path}?partner_id=${partnerId}&timestamp=${timestamp}&sign=${sign}`,
        {
          code: code,
          shop_id: parseInt(shopId),
          partner_id: parseInt(partnerId as string),
        },
      );

      const data = response.data;

      // Validate response
      if (!data || data.error || !data.access_token) {
        throw new BadRequestException(
          `Shopee API error: ${data?.message || 'Thiếu access_token'}`,
        );
      }

      // 3. Map vào DTO
      const shopDto: ShopReqDto = {
        platfrom_name: 'shopee',
        platform_shop_id: shopId,
        shop_name: data.shop_name || 'Shopee Shop',
        access_token: data.access_token,
        refresh_token: data.refresh_token || '',
        access_token_expires_at: new Date(
          Date.now() + (data.expire_in || 14400) * 1000,
        ),
        refresh_token_expires_at: new Date(
          Date.now() + (data.refresh_token_expire_in || 86400 * 30) * 1000,
        ),
        sync_config: { auto_sync_stock: true, auto_sync_price: false },
      };

      return await this.shopService.connectShop(shopDto, oauthState.userId);
    } catch (error) {
      console.error('Shopee callback error:', error);
      throw new BadRequestException(
        `Kết nối Shopee Shop thất bại: ${error.message}`,
      );
    }
  }

  /**
   * Refresh access token cho Shopee.
   *
   * Endpoint refresh thực tế có thể khác tùy API version.
   * Có thể override bằng biến môi trường SHOPEE_REFRESH_TOKEN_URL.
   */
  async refreshAccessToken(refreshToken: string, shopId: string) {
    const partnerId = this.configService.get<string>('SHOPEE_PARTNER_ID');
    if (!partnerId) {
      throw new BadRequestException('Thiếu cấu hình SHOPEE_PARTNER_ID');
    }

    if (!refreshToken) {
      throw new BadRequestException('Thiếu refresh token của Shopee shop');
    }

    const timestamp = Math.floor(Date.now() / 1000);
    const refreshPath = '/api/v2/auth/access_token/get';
    const sign = this.generateShopeeSign(refreshPath, timestamp);

    const refreshUrl =
      this.configService.get<string>('SHOPEE_REFRESH_TOKEN_URL') ||
      `https://partner.shopeemobile.com${refreshPath}`;

    const response = await axios.post(
      `${refreshUrl}?partner_id=${partnerId}&timestamp=${timestamp}&sign=${sign}`,
      {
        // Dùng đúng tên field theo API Shopee hiện đang lưu trong hệ thống.
        refresh_token: refreshToken,
        shop_id: Number(shopId),
        partner_id: Number(partnerId),
      },
    );

    const data = response.data;
    if (!data?.access_token) {
      throw new BadRequestException(
        'Shopee refresh token response không hợp lệ',
      );
    }

    // Chuẩn hóa kết quả để scheduler update DB thống nhất với TikTok.
    return {
      access_token: data.access_token,
      refresh_token: data.refresh_token || refreshToken,
      access_token_expires_at: new Date(
        Date.now() + (data.expire_in || 14400) * 1000,
      ),
      refresh_token_expires_at: new Date(
        Date.now() + (data.refresh_token_expire_in || 86400 * 30) * 1000,
      ),
    };
  }

  // Hàm tạo signature theo yêu cầu của Shopee
  private generateShopeeSign(path: string, timestamp: number): string {
    const partnerId = this.configService.get<string>('SHOPEE_PARTNER_ID');
    const secretKey = this.configService.get<string>('SHOPEE_SECRET_KEY');
    const baseString = `${partnerId}${path}${timestamp}`;
    return createHmac('sha256', secretKey as string)
      .update(baseString)
      .digest('hex');
  }

  // Hàm này sẽ được gọi định kỳ (ví dụ mỗi 5 phút) để dọn dẹp các state đã hết hạn
  private pruneExpiredStates() {
    const now = Date.now();
    for (const [key, value] of this.oauthStates.entries()) {
      if (value.expiresAt < now) {
        this.oauthStates.delete(key);
      }
    }
  }
}
