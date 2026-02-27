import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { OrdersItemsService } from './orders_items.service';
import { OrdersItemsController } from './orders_items.controller';
import { OrderItem } from 'src/entities/order_item.entity';
import { Order } from 'src/entities/order.entity';
import { ProductVariant } from 'src/entities/product_variants.entity';

@Module({
  imports: [TypeOrmModule.forFeature([OrderItem, Order, ProductVariant])],
  providers: [OrdersItemsService],
  controllers: [OrdersItemsController],
  exports: [OrdersItemsService],
})
export class OrdersItemsModule {}
