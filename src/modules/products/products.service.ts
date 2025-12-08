import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Product } from 'src/entities/product.entity';
import { Repository } from 'typeorm';
import { CreateProductDto } from './dto/create-product.dto';

@Injectable()
export class ProductsService {
  constructor(
    @InjectRepository(Product)
    private productRepository: Repository<Product>,
  ) {}

  async findAll(): Promise<Product[]> {
    return await this.productRepository.find();
  }

  async findOne(id: string): Promise<Product | null> {
    return await this.productRepository.findOne({ where: { id } });
  }

  async create(createProductDto: CreateProductDto): Promise<Product> {
    const product = this.productRepository.create(createProductDto);
    return await this.productRepository.save(product);
  }

  async update(id: string, updateProductDto: any): Promise<Product | null> {
    await this.productRepository.update(id, updateProductDto);
    return await this.findOne(id);
  }
}
