import { Controller, Post, Body, HttpCode } from '@nestjs/common';
import { AuthService } from './auth.service';
import { AuthLoginDto } from './dto/auth-login.dto';
import { AuthRegisterDto } from './dto/auth-register.dto';

@Controller('auth')
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  @Post('login')
  @HttpCode(200)
  async login(@Body() authDto: AuthLoginDto) {
    const { access_token, refresh_token } = await this.authService.login(
      authDto.email,
      authDto.password,
    );
    return { accessToken: access_token, refreshToken: refresh_token };
  }

  @Post('register')
  register(@Body() authDto: AuthRegisterDto) {
    return this.authService.register(authDto);
  }

  @Post('refresh-token')
  refreshToken(@Body('refreshToken') refreshToken: string) {
    return this.authService.refreshAccessToken(refreshToken);
  }

  @Post('logout')
  logout(@Body('refreshToken') refreshToken: string) {
    return this.authService.logout(refreshToken);
  }
}
