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

@Controller('shops')
@UseInterceptors(ClassSerializerInterceptor)
export class ShopsController {
  constructor(private readonly tiktokService: TikTokService) {}

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
}
