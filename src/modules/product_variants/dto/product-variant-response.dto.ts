import { Exclude, Expose, Type } from 'class-transformer';

export class ProductSummaryDto {
  @Expose()
  id: string;

  @Expose()
  name: string;

  @Expose()
  description: string;
}

export class InventorySummaryDto {
  @Expose()
  id: string;

  @Expose()
  stock_on_hand: number;

  @Expose()
  stock_locked: number;

  @Expose()
  stock_available: number;

  @Expose()
  last_updated_at: Date;
}

export class ProductVariantResponseDto {
  @Expose()
  id: string;

  @Expose()
  productId: string;

  @Expose()
  sku_code: string;

  @Expose()
  cost_price: number;

  @Expose()
  selling_price: number;

  @Expose()
  attributes: Record<string, any>;

  @Expose()
  @Type(() => ProductSummaryDto)
  product?: ProductSummaryDto;

  @Expose()
  @Type(() => InventorySummaryDto)
  inventory?: InventorySummaryDto;

  @Expose()
  created_at: Date;

  @Expose()
  updated_at: Date;
}
