import { Column, Entity, ManyToOne, JoinColumn } from 'typeorm';
import { BaseEntity } from './base/base.entity';
import { User } from './user.entity';

@Entity('sessions')
export class Session extends BaseEntity {
  @Column({ name: 'user_id' })
  userId: string;

  @ManyToOne(() => User, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'user_id' })
  user: User;

  @Column({ type: 'text' })
  refreshToken: string;

  @Column({ type: 'timestamptz' })
  expiresAt: Date;

  @Column({ nullable: true })
  userAgent?: string;

  @Column({ nullable: true })
  ipAddress?: string;
}
