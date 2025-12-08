import { registerAs } from '@nestjs/config';
import { TypeOrmModuleOptions } from '@nestjs/typeorm';

export default registerAs(
  'database',
  (): TypeOrmModuleOptions => ({
    type: 'postgres',
    url: process.env.DATABASE_URL,
    entities: [__dirname + '/**/*.entity{.ts,.js}'],
    synchronize: process.env.NODE_ENV !== 'production',
    autoLoadEntities: true,
    ssl: process.env.DB_SSL === 'true' ? { rejectUnauthorized: false } : false,
  }),
);
