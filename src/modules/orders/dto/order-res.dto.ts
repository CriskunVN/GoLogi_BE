import { Expose, Type } from 'class-transformer';

/**
 * DTO Response cho OrderItem
 */
export class OrderItemResponseDto {
  @Expose()
  id: string;

  @Expose()
  variantId: string;

  @Expose()
  quantity: number;

  @Expose()
  unitPriceAtPurchase: number;

  @Expose()
  platformSkuIdRef: string;

  @Expose()
  createdAt: Date;

  @Expose()
  updatedAt: Date;
}

/**
 * DTO Response cho Order
 */
export class OrderResponseDto {
  @Expose()
  id: string;

  @Expose()
  shopId: string;

  @Expose()
  platformOrderId: string;

  @Expose()
  orderStatus: string;

  @Expose()
  totalAmount: number;

  @Expose()
  customerInfo: Record<string, any>;

  @Expose()
  platformCreatedAt: Date;

  @Expose()
  createdAt: Date;

  @Expose()
  updatedAt: Date;

  @Expose()
  @Type(() => OrderItemResponseDto)
  items: OrderItemResponseDto[];
}
