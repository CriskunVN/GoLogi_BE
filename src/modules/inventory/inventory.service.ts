import { BadRequestException, Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Inventory } from 'src/entities/inventory.entity';
import { EntityManager, Repository } from 'typeorm';

@Injectable()
export class InventoryService {
  constructor(
    @InjectRepository(Inventory)
    private inventoryRepository: Repository<Inventory>,
  ) {}

  /**
   * 1. HÀM XEM TỒN KHO (Chỉ đọc, dùng để hiển thị lên app hoặc đồng bộ lên sàn)
   */
  async getAvailableStock(variantId: string): Promise<number> {
    const inventory = await this.inventoryRepository.findOne({
      where: { variantId: variantId },
    });

    if (!inventory) return 0;
    return inventory.stock_on_hand - inventory.stock_locked;
  }

  /**
   * 2. HÀM GIỮ KHO (Lock Stock) - Gọi khi có Webhook đơn hàng mới
   * Nhận EntityManager từ OrderService để chạy chung Transaction
   */
  async lockStock(
    variantId: string,
    quantity: number,
    manager: EntityManager,
  ): Promise<void> {
    const inventory = await manager.findOne(Inventory, {
      where: { variantId: variantId },
      lock: { mode: 'pessimistic_write' }, // chống race condition khi nhiều đơn hàng cùng giữ kho một sản phẩm,
    });

    if (!inventory) {
      throw new BadRequestException(
        `Sản phẩm ${variantId} không có trong kho.`,
      );
    }

    const availableStock = inventory.stock_on_hand - inventory.stock_locked;

    if (availableStock < quantity) {
      throw new BadRequestException(
        `Không đủ tồn kho cho ${variantId}. Hiện có: ${availableStock}, Yêu cầu: ${quantity}`,
      );
    }

    // Tăng số lượng đang giữ
    inventory.stock_locked += quantity;
    await manager.save(inventory);
  }

  /**
   * 3. HÀM NHẢ KHO (Release Stock) - Gọi khi khách hàng hoặc sàn hủy đơn
   */
  async releaseStock(
    variantId: string,
    quantity: number,
    manager: EntityManager,
  ): Promise<void> {
    const inventory = await manager.findOne(Inventory, {
      where: { variantId: variantId },
      lock: { mode: 'pessimistic_write' },
    });

    if (inventory) {
      // Giảm số lượng đang giữ (đảm bảo không bị âm)
      inventory.stock_locked = Math.max(0, inventory.stock_locked - quantity);
      await manager.save(inventory);
    }
  }

  /**
   * 4. HÀM TRỪ KHO THỰC TẾ (Deduct Stock) - Gọi khi đóng gói xong / giao cho đơn vị vận chuyển
   */
  async deductStock(
    variantId: string,
    quantity: number,
    manager: EntityManager,
  ): Promise<void> {
    const inventory = await manager.findOne(Inventory, {
      where: { variantId: variantId },
      lock: { mode: 'pessimistic_write' },
    });

    if (inventory) {
      // Trừ cả tồn thực tế và tồn đang giữ
      inventory.stock_on_hand -= quantity;
      inventory.stock_locked -= quantity;

      // Đảm bảo dữ liệu không bị âm do lỗi logic hệ thống
      if (inventory.stock_on_hand < 0 || inventory.stock_locked < 0) {
        throw new BadRequestException(
          `Lỗi nghiêm trọng: Tồn kho của ${variantId} bị âm sau khi xuất.`,
        );
      }

      await manager.save(inventory);
    }
  }
}
