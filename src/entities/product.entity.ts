import { BaseEntity } from 'src/entities/base/base.entity';
import { Column, Entity, OneToMany } from 'typeorm';
import { ProductVariant } from './product_variants.entity';

@Entity('products')
export class Product extends BaseEntity {
  @Column()
  name: string;

  @Column()
  description: string;

  @Column()
  image_url: string;

  @OneToMany(() => ProductVariant, (variant) => variant.product, {
    cascade: true,
  })
  variants: ProductVariant[];
}
