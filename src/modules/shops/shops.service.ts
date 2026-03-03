import {
  Injectable,
  NotFoundException,
  BadRequestException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Shop, ShopStatus } from 'src/entities/shop.entity';
import { Repository } from 'typeorm';
import { ShopReqDto } from './dto/shop-req.dto';
import { ShopResponseDto } from './dto/shop-res.dto';
import { plainToInstance } from 'class-transformer';

@Injectable()
export class ShopsService {
  constructor(
    @InjectRepository(Shop)
    private readonly shopsRepository: Repository<Shop>,
  ) {}

  async connectShop(shopConnectData: ShopReqDto, userId: string) {
    // Validate userId
    if (!userId) {
      throw new BadRequestException('User ID không được để trống');
    }

    // Kiểm tra xem shop đã tồn tại chưa (với cả userId để tránh conflict)
    const existingShop = await this.shopsRepository.findOne({
      where: {
        platform_shop_id: shopConnectData.platform_shop_id,
        platfrom_name: shopConnectData.platfrom_name,
        userId: userId,
      },
    });

    if (existingShop) {
      // Nếu shop đã tồn tại, cập nhật thông tin
      return this.updateShop(existingShop.id, shopConnectData);
    }

    // Nếu chưa có sync_config, khởi tạo mặc định
    const syncConfig = shopConnectData.sync_config || {
      auto_sync_stock: false,
      auto_sync_price: false,
    };

    // Tạo mới shop
    const newShop = this.shopsRepository.create({
      ...shopConnectData,
      userId: userId, // Lưu userId vào shop
      sync_config: syncConfig,
      status: shopConnectData.status || ShopStatus.ACTIVE,
    });

    const savedShop = await this.shopsRepository.save(newShop);
    return plainToInstance(ShopResponseDto, savedShop, {
      excludeExtraneousValues: true,
    });
  }

  private async updateShop(
    shopId: string,
    shopConnectData: ShopReqDto,
  ): Promise<ShopResponseDto> {
    const shopToUpdate = await this.shopsRepository.findOne({
      where: { id: shopId },
    });

    if (!shopToUpdate) {
      throw new NotFoundException('Không tìm thấy shop để cập nhật');
    }

    // Cập nhật thông tin shop
    shopToUpdate.shop_name = shopConnectData.shop_name;
    shopToUpdate.access_token = shopConnectData.access_token;
    shopToUpdate.refresh_token = shopConnectData.refresh_token;
    shopToUpdate.access_token_expires_at =
      shopConnectData.access_token_expires_at;
    shopToUpdate.refresh_token_expires_at =
      shopConnectData.refresh_token_expires_at;
    shopToUpdate.status = shopConnectData.status || ShopStatus.ACTIVE;

    // Cập nhật sync_config nếu có
    if (shopConnectData.sync_config) {
      shopToUpdate.sync_config = {
        ...shopToUpdate.sync_config,
        ...shopConnectData.sync_config,
      };
    }

    const updatedShop = await this.shopsRepository.save(shopToUpdate);
    return plainToInstance(ShopResponseDto, updatedShop, {
      excludeExtraneousValues: true,
    });
  }
}
