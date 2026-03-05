import { IsOptional, IsUUID, IsString, IsBoolean } from 'class-validator';
import { Type } from 'class-transformer';

export class QueryChannelMappingDto {
  @IsOptional()
  @IsUUID()
  variantId?: string;

  @IsOptional()
  @IsUUID()
  shopId?: string;

  @IsOptional()
  @IsString()
  platform_sku_id?: string;

  @IsOptional()
  @IsBoolean()
  @Type(() => Boolean)
  is_synced?: boolean;

  @IsOptional()
  @IsString()
  platfrom_name?: string; // 'shopee' hoặc 'tiktok'
}
