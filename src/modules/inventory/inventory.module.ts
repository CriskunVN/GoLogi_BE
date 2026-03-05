import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { InventoryService } from './inventory.service';
import { InventoryController } from './inventory.controller';
import { InventoryListener } from './listeners/inventory.listener';
import { Inventory } from 'src/entities/inventory.entity';
import { ProductVariant } from 'src/entities/product_variants.entity';

@Module({
  imports: [TypeOrmModule.forFeature([Inventory, ProductVariant])],
  providers: [InventoryService, InventoryListener],
  controllers: [InventoryController],
  exports: [InventoryService],
})
export class InventoryModule {}
