import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ChannelMappingsService } from './channel-mappings.service';
import { ChannelMappingsController } from './channel-mappings.controller';
import { ChannelMapping } from 'src/entities/channel_mapping.entity';
import { ProductVariant } from 'src/entities/product_variants.entity';
import { Shop } from 'src/entities/shop.entity';

@Module({
  imports: [TypeOrmModule.forFeature([ChannelMapping, ProductVariant, Shop])],
  providers: [ChannelMappingsService],
  controllers: [ChannelMappingsController],
  exports: [ChannelMappingsService],
})
export class ChannelMappingsModule {}
