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
@Index(['order_status'])
export class Order extends BaseEntity {
  @Column({ type: 'uuid' })
  shopId: string;

  @Index({ unique: true })
  @Column({ unique: true })
  platform_order_id: string;

  @Column({
    type: 'enum',
    enum: OrderStatus,
    default: OrderStatus.PENDING,
  })
  order_status: OrderStatus;

  @Column('decimal', { precision: 15, scale: 2 })
  total_amount: number;

  @Column('jsonb', { nullable: true })
  customer_info: Record<string, any>;

  @Column({ type: 'timestamptz', default: () => 'CURRENT_TIMESTAMP' })
  created_at: Date;

  @Column({ type: 'timestamptz', nullable: true })
  platform_created_at: Date;

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
