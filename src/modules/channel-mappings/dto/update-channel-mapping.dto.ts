import { IsString, IsOptional, IsBoolean } from 'class-validator';

export class UpdateChannelMappingDto {
  @IsString()
  @IsOptional()
  platform_product_id?: string;

  @IsString()
  @IsOptional()
  platform_sku_id?: string;

  @IsBoolean()
  @IsOptional()
  is_synced?: boolean;
}
