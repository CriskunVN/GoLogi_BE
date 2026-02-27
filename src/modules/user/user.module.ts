import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { UserService } from './user.service';
import { UserController } from './user.controller';
import { User } from '../../entities/user.entity';
import { Shop } from '../../entities/shop.entity';
import { Session } from '../../entities/session.entity';

@Module({
  imports: [TypeOrmModule.forFeature([User, Shop, Session])],
  controllers: [UserController],
  providers: [UserService],
  exports: [UserService],
})
export class UserModule {}
