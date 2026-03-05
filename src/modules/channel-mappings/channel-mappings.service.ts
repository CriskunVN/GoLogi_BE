import {
  Injectable,
  NotFoundException,
  ConflictException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { ChannelMapping } from 'src/entities/channel_mapping.entity';
import { CreateChannelMappingDto } from './dto/create-channel-mapping.dto';
import { UpdateChannelMappingDto } from './dto/update-channel-mapping.dto';
import { QueryChannelMappingDto } from './dto/query-channel-mapping.dto';
import { ChannelMappingResponseDto } from './dto/channel-mapping-response.dto';
import { plainToInstance } from 'class-transformer';

@Injectable()
export class ChannelMappingsService {
  constructor(
    @InjectRepository(ChannelMapping)
    private channelMappingRepository: Repository<ChannelMapping>,
  ) {}

  async create(
    createDto: CreateChannelMappingDto,
  ): Promise<ChannelMappingResponseDto> {
    // Check if mapping already exists
    const existingMapping = await this.channelMappingRepository.findOne({
      where: {
        variantId: createDto.variantId,
        shopId: createDto.shopId,
      },
    });

    if (existingMapping) {
      throw new ConflictException(
        'Channel mapping đã tồn tại cho variant và shop này',
      );
    }

    const channelMapping = this.channelMappingRepository.create(createDto);
    const savedMapping =
      await this.channelMappingRepository.save(channelMapping);
    return plainToInstance(ChannelMappingResponseDto, savedMapping, {
      excludeExtraneousValues: true,
    });
  }

  async findAll(
    queryDto: QueryChannelMappingDto,
  ): Promise<ChannelMappingResponseDto[]> {
    const query = this.channelMappingRepository.createQueryBuilder('mapping');
    query.leftJoinAndSelect('mapping.variant', 'variant');
    query.leftJoinAndSelect('mapping.shop', 'shop');

    if (queryDto.variantId) {
      query.andWhere('mapping.variantId = :variantId', {
        variantId: queryDto.variantId,
      });
    }

    if (queryDto.shopId) {
      query.andWhere('mapping.shopId = :shopId', {
        shopId: queryDto.shopId,
      });
    }

    if (queryDto.platform_sku_id) {
      query.andWhere('mapping.platform_sku_id = :platform_sku_id', {
        platform_sku_id: queryDto.platform_sku_id,
      });
    }

    if (queryDto.is_synced !== undefined) {
      query.andWhere('mapping.is_synced = :is_synced', {
        is_synced: queryDto.is_synced,
      });
    }

    if (queryDto.platfrom_name) {
      query.andWhere('shop.platform = :platform', {
        platform: queryDto.platfrom_name,
      });
    }

    const channelMappings = await query.getMany();
    return channelMappings.map((mapping) =>
      plainToInstance(ChannelMappingResponseDto, mapping, {
        excludeExtraneousValues: true,
      }),
    );
  }

  async findOne(id: string): Promise<ChannelMappingResponseDto> {
    const channelMapping = await this.channelMappingRepository.findOne({
      where: { id },
      relations: ['variant', 'shop'],
    });

    if (!channelMapping) {
      throw new NotFoundException(
        `Channel mapping với ID ${id} không tìm thấy`,
      );
    }

    return plainToInstance(ChannelMappingResponseDto, channelMapping, {
      excludeExtraneousValues: true,
    });
  }

  async update(
    id: string,
    updateDto: UpdateChannelMappingDto,
  ): Promise<ChannelMappingResponseDto> {
    const channelMapping = await this.findOne(id);

    Object.assign(channelMapping, updateDto);
    const updatedMapping =
      await this.channelMappingRepository.save(channelMapping);
    return plainToInstance(ChannelMappingResponseDto, updatedMapping, {
      excludeExtraneousValues: true,
    });
  }

  async remove(id: string): Promise<void> {
    const channelMapping = await this.channelMappingRepository.findOne({
      where: { id },
    });

    if (!channelMapping) {
      throw new NotFoundException(
        `Channel mapping với ID ${id} không tìm thấy`,
      );
    }

    await this.channelMappingRepository.remove(channelMapping);
  }

  async bulkCreate(
    createDtos: CreateChannelMappingDto[],
  ): Promise<ChannelMappingResponseDto[]> {
    const channelMappings = this.channelMappingRepository.create(createDtos);
    const savedMappings =
      await this.channelMappingRepository.save(channelMappings);
    return savedMappings.map((mapping) =>
      plainToInstance(ChannelMappingResponseDto, mapping, {
        excludeExtraneousValues: true,
      }),
    );
  }
}
