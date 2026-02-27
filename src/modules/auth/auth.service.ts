import { Inject, Injectable, UnauthorizedException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { User } from 'src/entities/user.entity';
import { Repository } from 'typeorm';
import { UserService } from '../user/user.service';
import { JwtService } from '@nestjs/jwt';
import { CreateUserDto } from '../user/dto/create-user.dto';
import { ConfigService } from '@nestjs/config';
import * as crypto from 'crypto';
import * as bcrypt from 'bcrypt';
import { Session } from 'src/entities/session.entity';

@Injectable()
export class AuthService {
  constructor(
    private userService: UserService,
    private jwtService: JwtService,
    private configService: ConfigService,
    @InjectRepository(Session)
    private readonly sessionRepository: Repository<Session>,
  ) {}

  async login(
    email: string,
    password: string,
  ): Promise<{ access_token: string; refresh_token: string }> {
    // 1. Kiểm tra user trong DB và xác thực mật khẩu
    const user = await this.userService.findByEmail(email);
    if (!user) {
      throw new UnauthorizedException('Sai mật khẩu hoặc email');
    }
    const isPasswordValid = await this.userService.validatePassword(
      password,
      user.password,
    );
    if (!isPasswordValid) {
      throw new UnauthorizedException('Sai mật khẩu hoặc email');
    }

    // 2. Tạo JWT tokens
    const { accessToken, refreshToken } = await this.generateTokens(
      user.id,
      user.email,
    );

    // 3. Lưu refresh token vào database
    await this.updateRefreshToken(user.id, refreshToken);

    return { access_token: accessToken, refresh_token: refreshToken };
  }

  async register(userDTO: CreateUserDto): Promise<User> {
    // 1. Tạo user mới
    const newUser = await this.userService.create({
      email: userDTO.email,
      password: userDTO.password,
      fullName: userDTO.fullName,
      phone: userDTO.phone,
    });

    // TODO: 2. Gửi email xác nhận đăng ký
    //
    return newUser;
  }

  async logout(refreshToken: string) {
    await this.sessionRepository.delete({ refreshToken });
  }

  async generateTokens(userId: string, email: string) {
    const payload = { sub: userId, email: email };
    // tạo access token
    const accessToken = await this.jwtService.signAsync(payload);

    // tạo refresh token
    const refreshToken = await crypto.randomBytes(32).toString('hex');

    return { accessToken, refreshToken };
  }

  async updateRefreshToken(userId: string, refreshToken: string) {
    // Hash refresh token trước khi lưu vào DB (bảo mật)
    const salt = await bcrypt.genSalt();
    const hashedRefreshToken = await bcrypt.hash(refreshToken, salt);

    // Tính thời gian hết hạn (7 ngày)
    const expiresAt = new Date();
    expiresAt.setDate(expiresAt.getDate() + 7);

    // Tạo session entity instance (để @BeforeInsert() hook chạy)
    const session = this.sessionRepository.create({
      userId: userId,
      refreshToken: hashedRefreshToken,
      expiresAt: expiresAt,
    });

    // Lưu vào DB
    await this.sessionRepository.save(session);
  }

  // Method để verify refresh token
  async validateRefreshToken(
    userId: string,
    refreshToken: string,
  ): Promise<boolean> {
    // Tìm tất cả sessions của user
    const sessions = await this.sessionRepository.find({
      where: { userId },
    });

    // Kiểm tra xem có session nào match với refresh token không
    for (const session of sessions) {
      const isMatch = await bcrypt.compare(refreshToken, session.refreshToken);
      if (isMatch && new Date() < session.expiresAt) {
        return true;
      }
    }

    return false;
  }

  // Method để refresh access token
  async refreshAccessToken(refreshToken: string) {
    try {
      // Decode refresh token để lấy userId (nếu bạn lưu info trong token)
      // Hoặc tìm trong DB
      const session = await this.sessionRepository.findOne({
        where: { refreshToken },
        relations: ['user'],
      });

      if (!session || new Date() > session.expiresAt) {
        throw new UnauthorizedException(
          'Refresh token không hợp lệ hoặc đã hết hạn',
        );
      }

      // Tạo access token mới
      const payload = { sub: session.userId, email: session.user.email };
      const accessToken = await this.jwtService.signAsync(payload);

      return { access_token: accessToken };
    } catch (error) {
      throw new UnauthorizedException('Refresh token không hợp lệ');
    }
  }
}
