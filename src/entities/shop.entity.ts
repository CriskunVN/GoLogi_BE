import { Column, Entity, Index, JoinColumn, ManyToOne } from 'typeorm';
import { BaseEntity } from './base/base.entity';
import { User } from './user.entity';

export enum ShopStatus {
  ACTIVE = 'active',
  DISCONNECTED = 'disconnected',
  TOKEN_EXPIRED = 'token_expired',
  ERROR = 'error',
}

@Entity('shops')
export class Shop extends BaseEntity {
  @Column()
  @Index()
  platfrom_name: string;

  @Column()
  @Index()
  platform_shop_id: string;

  @Column()
  shop_name: string;

  // Lưu chuỗi đã mã hóa (AES-256), Postgres lưu dưới dạng text là ổn
  @Column({ type: 'text' })
  access_token: string;

  @Column({ type: 'text' })
  refresh_token: string;

  // Lưu chính xác múi giờ. Shopee trả về timestamp unix, TikTok trả về timestamp giây.
  // Khi lưu vào đây, Postgres chuẩn hóa về UTC cực chuẩn.
  @Column({ type: 'timestamptz' })
  access_token_expires_at: Date;

  @Column({ type: 'timestamptz' })
  refresh_token_expires_at: Date;

  // Định nghĩa Enum ngay trong DB để đảm bảo data integrity
  @Column({
    type: 'enum',
    enum: ShopStatus,
    default: ShopStatus.ACTIVE,
  })
  status: ShopStatus;

  // Đây là điểm mạnh nhất. Thay vì lưu string JSON thường, JSONB dạng nhị phân
  // cho phép bạn query trực tiếp vào bên trong JSON.
  @Column({ type: 'jsonb', default: {} })
  sync_config: {
    auto_sync_stock: boolean;
    auto_sync_price: boolean;
    warehouse_mapping_id?: string; // TikTok cần map kho
    [key: string]: any;
  };

  // Log lỗi chi tiết trả về từ sàn (nếu có) để debug
  @Column({ type: 'jsonb', nullable: true })
  metadata: Record<string, any>;

  @Column({ type: 'uuid' })
  userId: string;

  @ManyToOne(() => User, (user) => user.shops, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'userId' })
  user: User;
}
