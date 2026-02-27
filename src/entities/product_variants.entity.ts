import {
  Column,
  Entity,
  JoinColumn,
  ManyToOne,
  OneToOne,
  OneToMany,
  Index,
  Unique,
} from 'typeorm';
import { BaseEntity } from './base/base.entity';
import { Product } from './product.entity';
import { Inventory } from './inventory.entity';
import { ChannelMapping } from './channel_mapping.entity';
import { OrderItem } from './order_item.entity';

@Entity('product_variants')
@Unique(['sku_code'])
@Index(['productId'])
export class ProductVariant extends BaseEntity {
  @Column({ type: 'uuid' })
  productId: string;

  @Column({ unique: true })
  sku_code: string;

  @Column('decimal', { precision: 10, scale: 2 })
  cost_price: number;

  @Column('decimal', { precision: 10, scale: 2 })
  selling_price: number;

  @Column('jsonb', { nullable: true })
  attributes: Record<string, any>;

  // Many-to-One relationship with Product
  @ManyToOne(() => Product, (product) => product.variants, {
    onDelete: 'CASCADE',
  })
  @JoinColumn({ name: 'productId' })
  product: Product;

  // One-to-One relationship with Inventory
  @OneToOne(() => Inventory, (inventory) => inventory.variant, {
    cascade: true,
    nullable: true,
  })
  inventory: Inventory;

  // One-to-Many relationship with ChannelMappings
  @OneToMany(() => ChannelMapping, (mapping) => mapping.variant, {
    cascade: true,
  })
  channelMappings: ChannelMapping[];

  // One-to-Many relationship with OrderItems
  @OneToMany(() => OrderItem, (item) => item.variant, {
    cascade: true,
  })
  orderItems: OrderItem[];
}
