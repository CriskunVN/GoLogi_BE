import {
  Column,
  Entity,
  JoinColumn,
  ManyToOne,
  OneToMany,
  Index,
} from 'typeorm';
import { BaseEntity } from './base/base.entity';
import { Shop } from './shop.entity';
import { OrderItem } from './order_item.entity';

export enum OrderStatus {
  PENDING = 'pending',
  PROCESSING = 'processing',
  SHIPPED = 'shipped',
  DELIVERED = 'delivered',
  CANCELLED = 'cancelled',
  RETURNED = 'returned',
}

@Entity('orders')
@Index(['shopId'])
@Index(['orderStatus'])
export class Order extends BaseEntity {
  @Column({ type: 'uuid' })
  shopId: string;

  @Index({ unique: true })
  @Column({ unique: true, name: 'platform_order_id' })
  platformOrderId: string;

  @Column({
    type: 'enum',
    enum: OrderStatus,
    default: OrderStatus.PENDING,
    name: 'order_status',
  })
  orderStatus: OrderStatus;

  @Column('decimal', { precision: 15, scale: 2, name: 'total_amount' })
  totalAmount: number;

  @Column('jsonb', { nullable: true, name: 'customer_info' })
  customerInfo: Record<string, any>;

  @Column({ type: 'timestamptz', nullable: true, name: 'platform_created_at' })
  platformCreatedAt: Date;

  // Many-to-One relationship with Shop
  @ManyToOne(() => Shop, (shop) => shop.orders, {
    onDelete: 'CASCADE',
  })
  @JoinColumn({ name: 'shopId' })
  shop: Shop;

  // One-to-Many relationship with OrderItems
  @OneToMany(() => OrderItem, (item) => item.order, {
    cascade: true,
  })
  items: OrderItem[];
}
