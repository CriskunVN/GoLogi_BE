import { Entity, Column, OneToMany } from 'typeorm';
import { BaseEntity } from './base/base.entity';
import { Shop } from './shop.entity';

@Entity('users')
export class User extends BaseEntity {
  @Column({ unique: true })
  email: string;

  @Column()
  password: string;

  @Column({ nullable: true })
  fullName: string;

  @Column({ nullable: true })
  phone: string;

  @Column({ default: true })
  isActive: boolean;

  @OneToMany(() => Shop, (shop) => shop.userId)
  shops: Shop[];
}
