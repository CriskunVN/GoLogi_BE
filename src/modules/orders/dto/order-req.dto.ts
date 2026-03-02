import {
  IsString,
  IsNumber,
  IsArray,
  IsOptional,
  IsObject,
  IsUUID,
  Min,
  ValidateNested,
  IsDecimal,
} from 'class-validator';
import { Type } from 'class-transformer';

/**
 * DTO cho từng OrderItem trong đơn hàng
 */
export class CreateOrderItemDto {
  @IsUUID()
  variantId: string;

  @IsNumber()
  @Min(1)
  quantity: number;

  @IsNumber()
  @Min(0)
  unitPriceAtPurchase: number;

  @IsString()
  platformSkuIdRef: string;
}

/**
 * DTO cho khách hàng (customer_info)
 */
export class CustomerInfoDto {
  @IsString()
  @IsOptional()
  name?: string;

  @IsString()
  @IsOptional()
  email?: string;

  @IsString()
  @IsOptional()
  phone?: string;

  @IsString()
  @IsOptional()
  address?: string;

  @IsString()
  @IsOptional()
  city?: string;

  @IsString()
  @IsOptional()
  district?: string;

  @IsString()
  @IsOptional()
  ward?: string;

  @IsString()
  @IsOptional()
  country?: string;

  @IsString()
  @IsOptional()
  platformCustomerId?: string;

  @IsObject()
  @IsOptional()
  metadata?: Record<string, any>;
}

/**
 * DTO cho request tạo Order từ Webhook
 */
export class OrderRequestDto {
  @IsUUID()
  shopId: string;

  @IsString()
  platformOrderId: string;

  @IsNumber()
  @Min(0)
  totalAmount: number;

  @ValidateNested()
  @Type(() => CustomerInfoDto)
  @IsOptional()
  customerInfo?: CustomerInfoDto;

  @ValidateNested({ each: true })
  @Type(() => CreateOrderItemDto)
  @IsArray()
  items: CreateOrderItemDto[];

  @IsString()
  @IsOptional()
  order_status?: string;

  @IsOptional()
  platform_created_at?: Date;
}
