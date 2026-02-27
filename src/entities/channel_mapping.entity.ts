import { Column, Entity, JoinColumn, ManyToOne, Index, Unique } from 'typeorm';
import { BaseEntity } from './base/base.entity';
import { ProductVariant } from './product_variants.entity';
import { Shop } from './shop.entity';

@Entity('channel_mappings')
@Unique(['variantId', 'shopId'])
@Index(['shopId'])
@Index(['variantId'])
export class ChannelMapping extends BaseEntity {
  @Column({ type: 'uuid' })
  variantId: string;

  @Column({ type: 'uuid' })
  shopId: string;

  @Column()
  platform_product_id: string;

  @Column()
  platform_sku_id: string;

  @Column({ default: false })
  is_synced: boolean;

  // Many-to-One relationship with ProductVariant
  @ManyToOne(() => ProductVariant, (variant) => variant.channelMappings, {
    onDelete: 'CASCADE',
  })
  @JoinColumn({ name: 'variantId' })
  variant: ProductVariant;

  // Many-to-One relationship with Shop
  @ManyToOne(() => Shop, (shop) => shop.channelMappings, {
    onDelete: 'CASCADE',
  })
  @JoinColumn({ name: 'shopId' })
  shop: Shop;
}
