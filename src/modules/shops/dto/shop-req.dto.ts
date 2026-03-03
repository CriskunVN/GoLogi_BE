import {
  IsString,
  IsNotEmpty,
  IsDateString,
  IsOptional,
  IsObject,
  IsEnum,
} from 'class-validator';
import { ShopStatus } from '../../../entities/shop.entity';

export class ShopReqDto {
  @IsString()
  @IsNotEmpty({ message: 'Tên sàn không được để trống' })
  platfrom_name: string;

  @IsString()
  @IsNotEmpty({ message: 'ID shop trên sàn không được để trống' })
  platform_shop_id: string;

  @IsString()
  @IsNotEmpty({ message: 'Tên gian hàng không được để trống' })
  shop_name: string;

  @IsString()
  @IsNotEmpty({ message: 'Access token không được để trống' })
  access_token: string;

  @IsString()
  @IsNotEmpty({ message: 'Refresh token không được để trống' })
  refresh_token: string;

  @IsDateString()
  @IsNotEmpty({ message: 'Thời gian hết hạn access token không được để trống' })
  access_token_expires_at: Date;

  @IsDateString()
  @IsNotEmpty({
    message: 'Thời gian hết hạn refresh token không được để trống',
  })
  refresh_token_expires_at: Date;

  @IsObject()
  @IsOptional()
  sync_config?: {
    auto_sync_stock: boolean;
    auto_sync_price: boolean;
    warehouse_mapping_id?: string;
    [key: string]: any;
  };

  @IsEnum(ShopStatus)
  @IsOptional()
  status?: ShopStatus;

  @IsObject()
  @IsOptional()
  metadata?: Record<string, any>;
}
