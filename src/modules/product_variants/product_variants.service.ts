import { Injectable, NotFoundException } from '@nestjs/common';
import { CreateProductVariantDto } from './dto/create-product_variant.dto';
import { UpdateProductVariantDto } from './dto/update-product_variant.dto';
import { ProductVariantResponseDto } from './dto/product-variant-response.dto';
import { ProductVariant } from 'src/entities/product_variants.entity';
import { Inventory } from 'src/entities/inventory.entity';
import { Repository } from 'typeorm';
import { plainToInstance } from 'class-transformer';
import { InjectRepository } from '@nestjs/typeorm';

@Injectable()
export class ProductVariantsService {
  constructor(
    @InjectRepository(ProductVariant)
    private productVariantRepository: Repository<ProductVariant>,
    @InjectRepository(Inventory)
    private inventoryRepository: Repository<Inventory>,
  ) {}
  async create(createProductVariantDto: CreateProductVariantDto) {
    const check = await this.productVariantRepository.findOne({
      where: {
        sku_code: createProductVariantDto.sku_code,
        product: { id: createProductVariantDto.productId },
      },
    });

    if (check != null) {
      throw new NotFoundException(
        `Product variant with SKU code ${createProductVariantDto.sku_code} already exists for this product`,
      );
    }

    // Tạo variant
    const variant = this.productVariantRepository.create(
      createProductVariantDto,
    );
    const savedVariant = await this.productVariantRepository.save(variant);

    // Tự động tạo inventory với stock ban đầu = 0
    const inventory = this.inventoryRepository.create({
      variantId: savedVariant.id,
      stock_on_hand: 0,
      stock_locked: 0,
      stock_available: 0,
      last_updated_at: new Date(),
    });
    await this.inventoryRepository.save(inventory);

    return savedVariant;
  }

  async findAll(): Promise<ProductVariantResponseDto[]> {
    const variants = await this.productVariantRepository.find({
      relations: ['product', 'inventory'],
    });
    // Chuyển đổi danh sách product variants sang ProductVariantResponseDto
    return variants.map((variant) =>
      plainToInstance(ProductVariantResponseDto, variant, {
        excludeExtraneousValues: true,
      }),
    );
  }

  async findOne(id: string): Promise<ProductVariantResponseDto> {
    const variant = await this.productVariantRepository.findOne({
      where: { id },
      relations: ['product', 'inventory'],
    });

    if (!variant) {
      throw new NotFoundException(`Product variant with ID ${id} not found`);
    }

    // Chuyển đổi product variant sang ProductVariantResponseDto
    return plainToInstance(ProductVariantResponseDto, variant, {
      excludeExtraneousValues: true,
    });
  }

  async update(
    id: string,
    updateProductVariantDto: UpdateProductVariantDto,
  ): Promise<ProductVariantResponseDto> {
    const variant = await this.productVariantRepository.findOne({
      where: { id },
      relations: ['product', 'inventory'],
    });

    if (!variant) {
      throw new NotFoundException(`Product variant with ID ${id} not found`);
    }

    // Cập nhật các trường của variant bằng dữ liệu từ DTO
    this.productVariantRepository.merge(variant, updateProductVariantDto);

    // Lưu lại variant đã được cập nhật vào database
    const updatedVariant = await this.productVariantRepository.save(variant);

    // Trả về variant đã được cập nhật dưới dạng DTO
    return plainToInstance(ProductVariantResponseDto, updatedVariant, {
      excludeExtraneousValues: true,
    });
  }

  async remove(id: string) {
    const variant = await this.productVariantRepository.findOne({
      where: { id },
      relations: ['product', 'inventory'],
    });

    if (!variant) {
      throw new Error(`Product variant with ID ${id} not found`);
    }

    return this.productVariantRepository.remove(variant);
  }
}
