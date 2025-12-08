import { BaseEntity } from 'src/entities/base/base.entity';
import { Column, Entity } from 'typeorm';

@Entity('products')
export class Product extends BaseEntity {
  @Column()
  name: string;

  @Column()
  description: string;

  @Column()
  image_url: string;
}
