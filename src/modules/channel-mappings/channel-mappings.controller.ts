import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  Post,
  Put,
  Query,
  HttpCode,
  HttpStatus,
} from '@nestjs/common';
import { ChannelMappingsService } from './channel-mappings.service';
import { CreateChannelMappingDto } from './dto/create-channel-mapping.dto';
import { UpdateChannelMappingDto } from './dto/update-channel-mapping.dto';
import { QueryChannelMappingDto } from './dto/query-channel-mapping.dto';
import { ChannelMappingResponseDto } from './dto/channel-mapping-response.dto';

@Controller('channel-mappings')
export class ChannelMappingsController {
  constructor(
    private readonly channelMappingsService: ChannelMappingsService,
  ) {}

  @Post()
  @HttpCode(HttpStatus.CREATED)
  async create(
    @Body() createDto: CreateChannelMappingDto,
  ): Promise<ChannelMappingResponseDto> {
    const channelMapping = await this.channelMappingsService.create(createDto);
    return new ChannelMappingResponseDto(channelMapping);
  }

  @Post('bulk')
  @HttpCode(HttpStatus.CREATED)
  async bulkCreate(
    @Body() createDtos: CreateChannelMappingDto[],
  ): Promise<ChannelMappingResponseDto[]> {
    const channelMappings =
      await this.channelMappingsService.bulkCreate(createDtos);
    return channelMappings.map(
      (mapping) => new ChannelMappingResponseDto(mapping),
    );
  }

  @Get()
  async findAll(
    @Query() queryDto: QueryChannelMappingDto,
  ): Promise<ChannelMappingResponseDto[]> {
    const channelMappings = await this.channelMappingsService.findAll(queryDto);
    return channelMappings.map(
      (mapping) => new ChannelMappingResponseDto(mapping),
    );
  }

  @Get(':id')
  async findOne(@Param('id') id: string): Promise<ChannelMappingResponseDto> {
    const channelMapping = await this.channelMappingsService.findOne(id);
    return new ChannelMappingResponseDto(channelMapping);
  }

  @Put(':id')
  async update(
    @Param('id') id: string,
    @Body() updateDto: UpdateChannelMappingDto,
  ): Promise<ChannelMappingResponseDto> {
    const channelMapping = await this.channelMappingsService.update(
      id,
      updateDto,
    );
    return new ChannelMappingResponseDto(channelMapping);
  }

  @Delete(':id')
  @HttpCode(HttpStatus.NO_CONTENT)
  async remove(@Param('id') id: string): Promise<void> {
    await this.channelMappingsService.remove(id);
  }
}
