import { BadRequestException, Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import axios from 'axios';
import { ShopReqDto } from '../dto/shop-req.dto';
import { ShopsService } from '../shops.service';
import { randomUUID } from 'crypto';

// Định nghĩa kiểu dữ liệu cho state OAuth
type OAuthStatePayload = {
  userId: string;
  expiresAt: number;
};

@Injectable()
export class TikTokService {
  private readonly oauthStateTtlMs = 10 * 60 * 1000;
  private readonly oauthStates = new Map<string, OAuthStatePayload>();

  // Các phương thức liên quan đến TikTok sẽ được triển khai ở đây
  constructor(
    private configService: ConfigService,
    private shopService: ShopsService,
  ) {}

  // tạo URL ủy quyền cho TikTok, sẽ trả về cả state để lưu vào session hoặc database tạm thời
  createAuthUrl(userId: string) {
    if (!userId) {
      throw new BadRequestException('User ID không hợp lệ');
    }

    const appKey = this.configService.get<string>('TIKTOK_APP_KEY');
    const redirectUri = this.configService.get<string>('TIKTOK_REDIRECT_URI');

    if (!appKey || !redirectUri) {
      throw new BadRequestException(
        'Thiếu cấu hình TIKTOK_APP_KEY hoặc TIKTOK_REDIRECT_URI',
      );
    }

    this.pruneExpiredStates();

    const state = randomUUID();
    this.oauthStates.set(state, {
      userId,
      expiresAt: Date.now() + this.oauthStateTtlMs,
    });

    const query = new URLSearchParams({
      app_key: appKey,
      response_type: 'code',
      redirect_uri: redirectUri,
      state,
    });

    return {
      state,
      authUrl: `https://auth.tiktok-shops.com/oauth/authorize?${query.toString()}`,
    };
  }

  // tiktok.service.ts
  async handleCallback(code: string, state: string) {
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

      const redirectUri = this.configService.get<string>('TIKTOK_REDIRECT_URI');

      // 1. Gọi API TikTok để đổi code lấy Token
      const response = await axios.post(
        'https://auth.tiktok-shops.com/api/v1/auth/token',
        {
          app_key: this.configService.get<string>('TIKTOK_APP_KEY'),
          app_secret: this.configService.get<string>('TIKTOK_APP_SECRET'),
          auth_code: code,
          grant_type: 'authorized_code',
          redirect_uri: redirectUri,
        },
      );

      const data = response.data?.data;

      // Validate dữ liệu trả về
      if (!data.seller_id || !data.access_token || !data.refresh_token) {
        throw new BadRequestException(
          'TikTok API response thiếu dữ liệu bắt buộc',
        );
      }

      // 2. Map dữ liệu vào ShopReqDto của bạn
      const shopDto: ShopReqDto = {
        platfrom_name: 'tiktok',
        platform_shop_id: data.seller_id,
        shop_name: data.seller_name || 'TikTok Shop',
        access_token: data.access_token,
        refresh_token: data.refresh_token,
        access_token_expires_at: new Date(
          Date.now() + (data.access_token_expire_in || 3600) * 1000,
        ),
        refresh_token_expires_at: new Date(
          Date.now() + (data.refresh_token_expire_in || 86400 * 30) * 1000,
        ),
        sync_config: { auto_sync_stock: true, auto_sync_price: false }, // Giá trị mặc định
      };

      return await this.shopService.connectShop(shopDto, oauthState.userId);
    } catch (error) {
      console.error('TikTok callback error:', error);
      throw new BadRequestException(
        `Kết nối TikTok Shop thất bại: ${error.message}`,
      );
    }
  }

  /**
   * Refresh access token cho TikTok Shop.
   *
   * Lưu ý: Endpoint refresh thực tế có thể khác tùy phiên bản API TikTok.
   * Có thể override bằng biến môi trường TIKTOK_REFRESH_TOKEN_URL.
   */
  async refreshAccessToken(refreshToken: string) {
    const appKey = this.configService.get<string>('TIKTOK_APP_KEY');
    const appSecret = this.configService.get<string>('TIKTOK_APP_SECRET');
    const refreshUrl =
      this.configService.get<string>('TIKTOK_REFRESH_TOKEN_URL') ||
      'https://auth.tiktok-shops.com/api/v1/auth/token/refresh';

    if (!appKey || !appSecret) {
      throw new BadRequestException(
        'Thiếu cấu hình TIKTOK_APP_KEY hoặc TIKTOK_APP_SECRET',
      );
    }

    if (!refreshToken) {
      throw new BadRequestException('Thiếu refresh token của TikTok shop');
    }

    const response = await axios.post(refreshUrl, {
      app_key: appKey,
      app_secret: appSecret,
      grant_type: 'refresh_token',
      refresh_token: refreshToken,
    });

    const data = response.data?.data;

    if (!data?.access_token) {
      throw new BadRequestException(
        'TikTok refresh token response không hợp lệ',
      );
    }

    // Chuẩn hóa dữ liệu trả về để Scheduler có thể update DB theo cùng một format.
    return {
      access_token: data.access_token,
      refresh_token: data.refresh_token || refreshToken,
      access_token_expires_at: new Date(
        Date.now() + (data.access_token_expire_in || 3600) * 1000,
      ),
      refresh_token_expires_at: new Date(
        Date.now() + (data.refresh_token_expire_in || 86400 * 30) * 1000,
      ),
    };
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
