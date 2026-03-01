import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Product } from 'src/entities/product.entity';
import { Repository } from 'typeorm';
import { CreateProductDto } from './dto/create-product.dto';
import { ProductResponseDto } from './dto/product-response.dto';
import { plainToInstance } from 'class-transformer';
import { UpdateProductDto } from './dto/update-product.dto';

@Injectable()
export class ProductsService {
  constructor(
    @InjectRepository(Product)
    private productRepository: Repository<Product>,
  ) {}

  async findAll(): Promise<ProductResponseDto[]> {
    const products = await this.productRepository.find({
      relations: ['variants'],
    });
    return products.map((product) =>
      plainToInstance(ProductResponseDto, product, {
        excludeExtraneousValues: true,
      }),
    );
  }

  async findOne(id: string): Promise<ProductResponseDto> {
    const product = await this.productRepository.findOne({
      where: { id },
      relations: ['variants'],
    });
    return plainToInstance(ProductResponseDto, product, {
      excludeExtraneousValues: true,
    });
  }

  async create(createProductDto: CreateProductDto): Promise<Product> {
    const product = this.productRepository.create(createProductDto);
    return await this.productRepository.save(product);
  }

  async update(
    id: string,
    updateProductDto: UpdateProductDto,
  ): Promise<ProductResponseDto> {
    const product = await this.productRepository.findOne({
      where: { id },
      relations: ['variants'],
    });

    if (!product) {
      throw new NotFoundException('Product not found');
    }

    this.productRepository.merge(product, updateProductDto);
    const updated = await this.productRepository.save(product);

    return plainToInstance(ProductResponseDto, updated, {
      excludeExtraneousValues: true,
    });
  }
}
