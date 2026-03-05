import {
  IsString,
  IsNotEmpty,
  IsUUID,
  IsBoolean,
  IsOptional,
} from 'class-validator';

export class CreateChannelMappingDto {
  @IsUUID()
  @IsNotEmpty({ message: 'Variant ID không được để trống' })
  variantId: string;

  @IsUUID()
  @IsNotEmpty({ message: 'Shop ID không được để trống' })
  shopId: string;

  @IsString()
  @IsNotEmpty({ message: 'Platform Product ID không được để trống' })
  platform_product_id: string;

  @IsString()
  @IsNotEmpty({ message: 'Platform SKU ID không được để trống' })
  platform_sku_id: string;

  @IsBoolean()
  @IsOptional()
  is_synced?: boolean;
}
