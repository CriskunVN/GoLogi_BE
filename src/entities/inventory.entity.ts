import { Check, Column, Entity, JoinColumn, OneToOne } from 'typeorm';
import { BaseEntity } from './base/base.entity';
import { ProductVariant } from './product_variants.entity';

@Entity('inventories')
// Yêu cầu Database ném lỗi ngay nếu logic này bị vi phạm
@Check(`"stock_locked" >= 0`)
@Check(`"stock_locked" <= "stock_on_hand"`)
export class Inventory extends BaseEntity {
  @Column({ type: 'uuid' })
  variantId: string;

  @Column()
  stock_on_hand: number;

  @Column()
  stock_locked: number;

  @Column()
  stock_available: number;

  @Column({ type: 'timestamptz', default: () => 'CURRENT_TIMESTAMP' })
  last_updated_at: Date;

  // One-to-One relationship with ProductVariant
  @OneToOne(() => ProductVariant, (variant) => variant.inventory, {
    onDelete: 'CASCADE',
  })
  @JoinColumn({ name: 'variantId' })
  variant: ProductVariant;
}
