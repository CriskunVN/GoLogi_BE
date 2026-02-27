import { Entity, Column, OneToMany } from 'typeorm';
import { BaseEntity } from './base/base.entity';
import { Shop } from './shop.entity';
import { Exclude, Expose } from 'class-transformer';
import { ClassSerializerInterceptor, UseInterceptors } from '@nestjs/common';

@Entity('users')
@Exclude()
export class User extends BaseEntity {
  @Column({ unique: true })
  @Expose()
  email: string;

  @Column({ name: 'password_hash', select: false })
  password: string;

  @Column({ nullable: true })
  @Expose()
  fullName: string;

  @Column({ nullable: true })
  @Expose()
  phone: string;

  @Column({ default: true })
  @Expose()
  isActive: boolean;

  @OneToMany(() => Shop, (shop) => shop.userId)
  @Expose()
  shops: Shop[];

  @Column({ default: 'admin', nullable: true })
  role: string;
}
