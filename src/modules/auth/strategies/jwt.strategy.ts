import { ExtractJwt, Strategy } from 'passport-jwt';
import { PassportStrategy } from '@nestjs/passport';
import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';

@Injectable()
export class JwtStrategy extends PassportStrategy(Strategy) {
  constructor(private configService: ConfigService) {
    const jwtSecret = configService.get<string>('SECRET_KEY_JWT');

    if (!jwtSecret) {
      throw new Error('SECRET_KEY_JWT is not defined in environment variables');
    }

    super({
      // Lấy token từ Header
      jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
      ignoreExpiration: false,
      secretOrKey: jwtSecret,
    });
  }

  // Khi token hợp lệ hàm này sẽ chạy và gán kết quả vào request.user
  async validate(payload: any) {
    return { userId: payload.sub, email: payload.email };
  }
}
