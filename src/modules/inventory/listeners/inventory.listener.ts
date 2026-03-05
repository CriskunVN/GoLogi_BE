import { Injectable, Logger } from '@nestjs/common';
import { OnEvent } from '@nestjs/event-emitter';

@Injectable()
export class InventoryListener {
  private readonly logger = new Logger(InventoryListener.name);

  @OnEvent('inventory.stock_changed')
  async handleStockChanged(payload: {
    orderId: string;
    shopId: string;
    platformOrderId: string;
    items: Array<{
      variantId: string;
      quantity: number;
      platformSkuIdRef: string;
    }>;
  }) {
    this.logger.log(
      `📦 Event: Tồn kho thay đổi cho đơn hàng ${payload.platformOrderId}`,
    );
    this.logger.log(`   - Order ID: ${payload.orderId}`);
    this.logger.log(`   - Shop ID: ${payload.shopId}`);
    this.logger.log(`   - Platform Order ID: ${payload.platformOrderId}`);
    this.logger.log(`   - Items: ${JSON.stringify(payload.items, null, 2)}`);

    // TODO: Gọi API của Shopee/TikTok để cập nhật stock_available
    // const result = await this.shopeeService.updateStockOnPlatform(
    //   payload.shopId,
    //   payload.items,
    // );
    // if (result.success) {
    //   this.logger.log(`✅ Đã cập nhật tồn kho trên sàn thành công`);
    // } else {
    //   this.logger.error(`❌ Lỗi cập nhật tồn kho trên sàn: ${result.error}`);
    // }
  }
}
