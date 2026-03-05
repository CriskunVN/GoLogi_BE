import { Expose, Type } from 'class-transformer';

class VariantSummaryDto {
  @Expose()
  id: string;

  @Expose()
  sku_code: string;

  @Expose()
  selling_price: number;
}

class ShopSummaryDto {
  @Expose()
  id: string;

  @Expose()
  shop_name: string;

  @Expose()
  platfrom_name: string;
}

export class ChannelMappingResponseDto {
  @Expose()
  id: string;

  @Expose()
  variantId: string;

  @Expose()
  shopId: string;

  @Expose()
  platform_product_id: string;

  @Expose()
  platform_sku_id: string;

  @Expose()
  is_synced: boolean;

  @Expose()
  @Type(() => VariantSummaryDto)
  variant?: VariantSummaryDto;

  @Expose()
  @Type(() => ShopSummaryDto)
  shop?: ShopSummaryDto;

  @Expose()
  created_at: Date;

  @Expose()
  updated_at: Date;

  constructor(partial: Partial<ChannelMappingResponseDto>) {
    Object.assign(this, partial);
  }
}
