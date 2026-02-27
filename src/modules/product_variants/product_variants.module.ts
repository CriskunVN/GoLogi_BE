import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ProductVariantsService } from './product_variants.service';
import { ProductVariantsController } from './product_variants.controller';
import { ProductVariant } from 'src/entities/product_variants.entity';
import { Inventory } from 'src/entities/inventory.entity';
import { ChannelMapping } from 'src/entities/channel_mapping.entity';
import { Product } from 'src/entities/product.entity';

@Module({
  imports: [
    TypeOrmModule.forFeature([
      ProductVariant,
      Inventory,
      ChannelMapping,
      Product,
    ]),
  ],
  controllers: [ProductVariantsController],
  providers: [ProductVariantsService],
  exports: [ProductVariantsService],
})
export class ProductVariantsModule {}
