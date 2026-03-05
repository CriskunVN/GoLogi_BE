import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ShopsService } from './shops.service';
import { ShopsController } from './shops.controller';
import { Shop } from '../../entities/shop.entity';
import { User } from '../../entities/user.entity';
import { Order } from '../../entities/order.entity';
import { ChannelMapping } from '../../entities/channel_mapping.entity';
import { TikTokService } from './tiktok/tiktok.service';
import { ShopeeService } from './shopee/shopee.service';
import { TokenRefreshScheduler } from './jobs/token-refresh.scheduler';

@Module({
  imports: [TypeOrmModule.forFeature([Shop, User, Order, ChannelMapping])],
  controllers: [ShopsController],
  providers: [
    ShopsService,
    TikTokService,
    ShopeeService,
    // Provider này chạy nền để tự động refresh token định kỳ.
    TokenRefreshScheduler,
  ],
  exports: [ShopsService],
})
export class ShopsModule {}
