import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ShopsService } from './shops.service';
import { ShopsController } from './shops.controller';
import { Shop } from '../../entities/shop.entity';
import { User } from '../../entities/user.entity';
import { Order } from '../../entities/order.entity';
import { ChannelMapping } from '../../entities/channel_mapping.entity';

@Module({
  imports: [TypeOrmModule.forFeature([Shop, User, Order, ChannelMapping])],
  controllers: [ShopsController],
  providers: [ShopsService],
  exports: [ShopsService],
})
export class ShopsModule {}
