import { Injectable } from '@nestjs/common';
import { EventEmitter2 } from '@nestjs/event-emitter';
import { InventoryService } from '../inventory/inventory.service';
import { DataSource } from 'typeorm';
import { Order, OrderStatus } from 'src/entities/order.entity';
import { OrderItem } from 'src/entities/order_item.entity';
import { OrderRequestDto } from './dto/order-req.dto';
import { plainToInstance } from 'class-transformer';
import { OrderResponseDto } from './dto/order-res.dto';

@Injectable()
export class OrdersService {
  constructor(
    private dataSource: DataSource,
    private inventoryService: InventoryService,
    private eventEmitter: EventEmitter2,
  ) {}

  async createOrderFromWebhook(orderData: OrderRequestDto) {
    const queryRunner = this.dataSource.createQueryRunner();
    await queryRunner.connect();
    await queryRunner.startTransaction();

    try {
      // 1. GỌI HÀM GIỮ KHO cho tất cả items
      for (const item of orderData.items) {
        await this.inventoryService.lockStock(
          item.variantId,
          item.quantity,
          queryRunner.manager,
        );
      }

      // 2. TẠO VÀ LƯU ORDER
      const newOrder = queryRunner.manager.create(Order, {
        platformOrderId: orderData.platformOrderId,
        shopId: orderData.shopId,
        totalAmount: orderData.totalAmount,
        customerInfo: orderData.customerInfo,
        orderStatus:
          (orderData.order_status as OrderStatus) || OrderStatus.PENDING,
        platformCreatedAt: orderData.platform_created_at,
      });

      const savedOrder = await queryRunner.manager.save(newOrder);

      // 3. TẠO VÀ LƯU CÁC ORDER ITEMS
      const orderItemsEntities = orderData.items.map((item) => {
        return queryRunner.manager.create(OrderItem, {
          orderId: savedOrder.id,
          variantId: item.variantId,
          quantity: item.quantity,
          unitPriceAtPurchase: item.unitPriceAtPurchase,
          platformSkuIdRef: item.platformSkuIdRef,
        });
      });

      await queryRunner.manager.save(orderItemsEntities);

      // 4. COMMIT TRANSACTION
      await queryRunner.commitTransaction();

      // Load lại order với items để trả về đầy đủ
      const fullOrder = await queryRunner.manager.findOne(Order, {
        where: { id: savedOrder.id },
        relations: ['items'],
      });

      // 5. BẮN EVENT SAU KHI COMMIT THÀNH CÔNG
      this.eventEmitter.emit('inventory.stock_changed', {
        orderId: savedOrder.id,
        shopId: savedOrder.shopId,
        platformOrderId: savedOrder.platformOrderId,
        items: orderData.items,
      });

      return plainToInstance(OrderResponseDto, fullOrder, {
        excludeExtraneousValues: true,
      });

      // TODO: Bắn Event báo cho TikTok/Shopee cập nhật lại tồn kho hiển thị (stock_available)
    } catch (error) {
      await queryRunner.rollbackTransaction(); // Nếu hết kho, hoàn tác toàn bộ
      throw error;
    } finally {
      await queryRunner.release();
    }
  }
}
