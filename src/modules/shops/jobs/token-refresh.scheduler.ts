import { Injectable, Logger } from '@nestjs/common';
import { Cron, CronExpression } from '@nestjs/schedule';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Shop, ShopStatus } from 'src/entities/shop.entity';
import { ShopeeService } from '../shopee/shopee.service';
import { TikTokService } from '../tiktok/tiktok.service';

@Injectable()
export class TokenRefreshScheduler {
  private readonly logger = new Logger(TokenRefreshScheduler.name);

  // Cửa sổ an toàn: khi token còn <= 10 phút thì refresh trước.
  private readonly refreshWindowMs = 10 * 60 * 1000;

  constructor(
    @InjectRepository(Shop)
    private readonly shopRepository: Repository<Shop>,
    private readonly shopeeService: ShopeeService,
    private readonly tiktokService: TikTokService,
  ) {}

  /**
   * Job chạy mỗi 5 phút để tìm token sắp hết hạn và refresh tự động.
   *
   * Tại sao chạy theo lịch ngắn?
   * - Giảm rủi ro token hết hạn đúng lúc có webhook/order đến.
   * - Không cần refresh liên tục mọi shop => tiết kiệm tài nguyên.
   */
  @Cron(CronExpression.EVERY_5_MINUTES)
  async refreshExpiringTokens() {
    const now = new Date();
    const threshold = new Date(now.getTime() + this.refreshWindowMs);

    // Chỉ lấy shop còn hoạt động, access token sắp hết hạn,
    // và refresh token vẫn còn hiệu lực.
    const shopsNeedRefresh = await this.shopRepository
      .createQueryBuilder('shop')
      .where('shop.status = :status', { status: ShopStatus.ACTIVE })
      .andWhere('shop.access_token_expires_at <= :threshold', { threshold })
      .andWhere('shop.refresh_token_expires_at > :now', { now })
      .getMany();

    if (!shopsNeedRefresh.length) {
      return;
    }

    this.logger.log(
      `Bắt đầu refresh token cho ${shopsNeedRefresh.length} shop(s)`,
    );

    for (const shop of shopsNeedRefresh) {
      try {
        // Phân luồng theo platform để gọi đúng API refresh tương ứng.
        const refreshed = await this.refreshTokenByPlatform(shop);

        // Update token mới vào DB ngay sau khi refresh thành công.
        shop.access_token = refreshed.access_token;
        shop.refresh_token = refreshed.refresh_token;
        shop.access_token_expires_at = refreshed.access_token_expires_at;
        shop.refresh_token_expires_at = refreshed.refresh_token_expires_at;
        shop.status = ShopStatus.ACTIVE;

        // Lưu metadata giúp debug lịch sử refresh.
        shop.metadata = {
          ...(shop.metadata || {}),
          last_refresh_at: new Date().toISOString(),
          last_refresh_error: null,
        };

        await this.shopRepository.save(shop);

        this.logger.log(
          `Refresh token thành công | platform=${shop.platfrom_name} shopId=${shop.platform_shop_id}`,
        );
      } catch (error) {
        // Không throw để tránh 1 shop lỗi làm dừng toàn bộ job.
        this.logger.error(
          `Refresh token thất bại | platform=${shop.platfrom_name} shopId=${shop.platform_shop_id} | error=${error?.message}`,
        );

        // Nếu refresh token không còn hợp lệ, đánh dấu trạng thái để cần reconnect OAuth.
        shop.status = ShopStatus.TOKEN_EXPIRED;
        shop.metadata = {
          ...(shop.metadata || {}),
          last_refresh_at: new Date().toISOString(),
          last_refresh_error: error?.message || 'Unknown error',
        };
        await this.shopRepository.save(shop);
      }
    }
  }

  /**
   * Hàm điều phối refresh theo từng nền tảng.
   * Tách riêng hàm này để dễ mở rộng thêm platform khác sau này.
   */
  private async refreshTokenByPlatform(shop: Shop) {
    if (shop.platfrom_name === 'shopee') {
      return this.shopeeService.refreshAccessToken(
        shop.refresh_token,
        shop.platform_shop_id,
      );
    }

    if (shop.platfrom_name === 'tiktok') {
      return this.tiktokService.refreshAccessToken(shop.refresh_token);
    }

    throw new Error(
      `Platform không hỗ trợ refresh token: ${shop.platfrom_name}`,
    );
  }
}
