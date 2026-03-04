import {
  BadRequestException,
  ClassSerializerInterceptor,
  Controller,
  Get,
  Query,
  Req,
  UseGuards,
  UseInterceptors,
} from '@nestjs/common';
import { TikTokService } from './tiktok/tiktok.service';
import { JWTAuthGuard } from '../auth/guards/jwt-auth.guard';
import { ShopeeService } from './shopee/shopee.service';

@Controller('shops')
@UseInterceptors(ClassSerializerInterceptor)
export class ShopsController {
  constructor(
    private readonly tiktokService: TikTokService,
    private readonly shopeeService: ShopeeService,
  ) {}

  @Get('tiktok/auth-url')
  @UseGuards(JWTAuthGuard)
  async getTikTokAuthUrl(@Req() req) {
    const userId = req.user?.id;
    if (!userId) {
      throw new BadRequestException('User ID không hợp lệ');
    }

    return this.tiktokService.createAuthUrl(userId);
  }

  @Get('tiktok/callback')
  async handleTiktokCallback(
    @Query('code') code: string,
    @Query('state') state: string,
  ) {
    if (!code) {
      throw new BadRequestException('Không tìm thấy mã ủy quyền');
    }
    if (!state) {
      throw new BadRequestException('Không tìm thấy state OAuth');
    }

    return await this.tiktokService.handleCallback(code, state);
  }

  @Get('shopee/auth-url')
  @UseGuards(JWTAuthGuard)
  async getShopeeAuthUrl(@Req() req) {
    const userId = req.user?.id;
    if (!userId) {
      throw new BadRequestException('User ID không hợp lệ');
    }

    return this.shopeeService.createAuthUrl(userId);
  }

  @Get('shopee/callback')
  async handleShopeeCallback(
    @Query('code') code: string,
    @Query('state') state: string,
  ) {
    if (!code) {
      throw new BadRequestException('Không tìm thấy mã ủy quyền');
    }
    if (!state) {
      throw new BadRequestException('Không tìm thấy state OAuth');
    }

    return await this.tiktokService.handleCallback(code, state);
  }
}
