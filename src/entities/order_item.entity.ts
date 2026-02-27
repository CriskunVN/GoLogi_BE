import { Column, Entity, JoinColumn, ManyToOne, Index } from 'typeorm';
import { BaseEntity } from './base/base.entity';
import { Order } from './order.entity';
import { ProductVariant } from './product_variants.entity';

@Entity('order_items')
@Index(['orderId'])
@Index(['variantId'])
export class OrderItem extends BaseEntity {
  @Column({ type: 'uuid' })
  orderId: string;

  @Column({ type: 'uuid' })
  variantId: string;

  @Column()
  quantity: number;

  @Column('decimal', { precision: 10, scale: 2 })
  unit_price_at_purchase: number;

  @Column()
  platform_sku_id_ref: string;

  // Many-to-One relationship with Order
  @ManyToOne(() => Order, (order) => order.items, {
    onDelete: 'CASCADE',
  })
  @JoinColumn({ name: 'orderId' })
  order: Order;

  // Many-to-One relationship with ProductVariant
  @ManyToOne(() => ProductVariant, (variant) => variant.orderItems, {
    onDelete: 'CASCADE',
  })
  @JoinColumn({ name: 'variantId' })
  variant: ProductVariant;
}
