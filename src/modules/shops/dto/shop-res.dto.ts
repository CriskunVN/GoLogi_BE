import { Expose } from 'class-transformer';
import { ShopStatus } from '../../../entities/shop.entity';

export class ShopResponseDto {
  @Expose()
  id: string;

  @Expose()
  platfrom_name: string;

  @Expose()
  platform_shop_id: string;

  @Expose()
  shop_name: string;

  @Expose()
  status: ShopStatus;

  @Expose()
  access_token_expires_at: Date;

  @Expose()
  refresh_token_expires_at: Date;

  @Expose()
  sync_config: {
    auto_sync_stock: boolean;
    auto_sync_price: boolean;
    warehouse_mapping_id?: string;
    [key: string]: any;
  };

  @Expose()
  metadata: Record<string, any>;

  @Expose()
  userId: string;

  @Expose()
  created_at: Date;

  @Expose()
  updated_at: Date;

  // KHÔNG expose access_token và refresh_token (sensitive data)
}
