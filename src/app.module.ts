import { Module } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { TypeOrmModule, TypeOrmModuleOptions } from '@nestjs/typeorm';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { UserModule } from './modules/user/user.module';
import configuration from './config/database.config';
import databaseConfig from './config/database.config';
import { DataSource } from 'typeorm';
import { ProductsModule } from './modules/products/products.module';
import { ShopsModule } from './modules/shops/shops.module';
import { AuthModule } from './modules/auth/auth.module';
import { ProductVariantsModule } from './modules/product_variants/product_variants.module';
import { OrdersItemsModule } from './modules/orders_items/orders_items.module';
import { OrdersModule } from './modules/orders/orders.module';
import { ChannelMappingsModule } from './modules/channel-mappings/channel-mappings.module';
import { InventoryModule } from './modules/inventory/inventory.module';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
      envFilePath: '.env',
      load: [databaseConfig], // Load tất cả config
    }),
    TypeOrmModule.forRootAsync({
      imports: [ConfigModule],
      useFactory: (configService: ConfigService) => {
        const config = configService.get<TypeOrmModuleOptions>('database');
        if (!config) throw new Error('Không tìm thấy config database!');
        return config;
      },
      inject: [ConfigService],
    }),
    UserModule,
    ProductsModule,
    ShopsModule,
    AuthModule,
    ProductVariantsModule,
    InventoryModule,
    ChannelMappingsModule,
    OrdersModule,
    OrdersItemsModule,
  ],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {
  constructor(private dataSource: DataSource) {}
  onModuleInit() {
    if (this.dataSource.isInitialized) {
      console.log('DB connected successfully');
    } else {
      console.log('DB not connected');
    }
  }
}
