import { Expose, Type } from 'class-transformer';

// DTO tóm tắt variant (khi hiển thị trong product)
class ProductVariantSummaryDto {
  @Expose()
  id: string;

  @Expose()
  sku_code: string;

  @Expose()
  cost_price: number;

  @Expose()
  selling_price: number;

  @Expose()
  attributes: Record<string, any>;
}

// DTO response chính
export class ProductResponseDto {
  @Expose()
  id: string;

  @Expose()
  name: string;

  @Expose()
  description: string;

  @Expose()
  image_url: string;

  @Expose()
  @Type(() => ProductVariantSummaryDto)
  variants?: ProductVariantSummaryDto[];

  @Expose()
  created_at: Date;

  @Expose()
  updated_at: Date;
}
