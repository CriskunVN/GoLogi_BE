import {
  CreateDateColumn,
  UpdateDateColumn,
  BeforeInsert,
  PrimaryColumn,
} from 'typeorm';
import { uuidv7 } from 'uuidv7';

export abstract class BaseEntity {
  @PrimaryColumn('uuid')
  id: string;

  @CreateDateColumn({ type: 'timestamptz' }) // 'timestamptz' là chuẩn cho Postgres (có múi giờ)
  createdAt: Date;

  @UpdateDateColumn({ type: 'timestamptz' })
  updatedAt: Date;

  // 👇 Hook này tự động chạy trước khi lưu vào DB
  @BeforeInsert()
  generateId() {
    if (!this.id) {
      this.id = uuidv7();
    }
  }
}
