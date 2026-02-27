import { Module } from '@nestjs/common';
import { ProductsService } from './products.service';
import { ProductsController } from './products.controller';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Product } from 'src/entities/product.entity';
import { ProductVariant } from 'src/entities/product_variants.entity';
import { Inventory } from 'src/entities/inventory.entity';

@Module({
  controllers: [ProductsController],
  imports: [TypeOrmModule.forFeature([Product, ProductVariant, Inventory])],
  providers: [ProductsService],
  exports: [ProductsService],
})
export class ProductsModule {}
