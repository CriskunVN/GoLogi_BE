import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { OrdersService } from './orders.service';
import { OrdersController } from './orders.controller';
import { Order } from 'src/entities/order.entity';
import { OrderItem } from 'src/entities/order_item.entity';
import { Shop } from 'src/entities/shop.entity';
import { ProductVariant } from 'src/entities/product_variants.entity';

@Module({
  imports: [TypeOrmModule.forFeature([Order, OrderItem, Shop, ProductVariant])],
  providers: [OrdersService],
  controllers: [OrdersController],
  exports: [OrdersService],
})
export class OrdersModule {}
