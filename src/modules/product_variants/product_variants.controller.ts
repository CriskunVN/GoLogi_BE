import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  UseInterceptors,
  ClassSerializerInterceptor,
} from '@nestjs/common';
import { ProductVariantsService } from './product_variants.service';
import { CreateProductVariantDto } from './dto/create-product_variant.dto';
import { UpdateProductVariantDto } from './dto/update-product_variant.dto';
import { ProductVariantResponseDto } from './dto/product-variant-response.dto';

@Controller('product-variants')
@UseInterceptors(ClassSerializerInterceptor)
export class ProductVariantsController {
  constructor(
    private readonly productVariantsService: ProductVariantsService,
  ) {}

  @Post()
  create(@Body() createProductVariantDto: CreateProductVariantDto) {
    return this.productVariantsService.create(createProductVariantDto);
  }

  @Get()
  async findAll(): Promise<ProductVariantResponseDto[]> {
    return this.productVariantsService.findAll();
  }

  @Get(':id')
  async findOne(@Param('id') id: string): Promise<ProductVariantResponseDto> {
    return this.productVariantsService.findOne(id);
  }

  @Patch(':id')
  update(
    @Param('id') id: string,
    @Body() updateProductVariantDto: UpdateProductVariantDto,
  ): Promise<ProductVariantResponseDto> {
    return this.productVariantsService.update(id, updateProductVariantDto);
  }

  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.productVariantsService.remove(id);
  }
}
