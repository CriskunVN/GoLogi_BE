import { Injectable } from '@nestjs/common';
import { ShopReqDto } from '../dto/shop-req.dto';
import { ConfigService } from '@nestjs/config';
import { ShopsService } from '../shops.service';
import axios from 'axios';

@Injectable()
export class ShopeeService {
  // Các phương thức liên quan đến Shopee sẽ được triển khai ở đây
  constructor(
    private configService: ConfigService,
    private shopService: ShopsService,
  ) {}

  // shopee.service.ts
  async handleCallback(code: string, shopId: string) {
    // // 1. Tạo signature theo công thức của Shopee (dùng crypto hmac sha256)
    // const timestamp = Math.floor(Date.now() / 1000);
    //   const sign = this.generateShopeeSign('/api/v2/auth/access_token/get', timestamp);
    // // 2. Đổi code lấy token
    // const response = await axios.post(
    //   `https://partner.shopeemobile.com/api/v2/auth/access_token/get?partner_id=${PID}&timestamp=${timestamp}&sign=${sign}`,
    //   {
    //     code: code,
    //     partner_id: this.configService.get<string>('SHOPEE_PARTNER_ID'),
    //     shop_id: parseInt(shopId),
    //   },
    // );
    // const data = response.data;
    // // 3. Map vào DTO tương tự TikTok
    // const shopDto: ShopReqDto = {
    //   platfrom_name: 'tiktok',
    //   platform_shop_id: data.seller_id,
    //   shop_name: data.seller_name, // Thường lấy qua 1 API khác của TikTok
    //   access_token: data.access_token,
    //   refresh_token: data.refresh_token,
    //   access_token_expires_at: new Date(
    //     Date.now() + data.access_token_expire_in * 1000,
    //   ),
    //   refresh_token_expires_at: new Date(
    //     Date.now() + data.refresh_token_expire_in * 1000,
    //   ),
    //   sync_config: { auto_sync_stock: false, auto_sync_price: false }, // Giá trị mặc định
    // };
    // return this.shopService.connectShop(shopDto);
  }
}
