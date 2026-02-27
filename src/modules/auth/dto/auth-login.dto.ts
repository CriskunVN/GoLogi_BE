import { IsEmail, IsNotEmpty, IsString } from 'class-validator';

export class AuthLoginDto {
  @IsEmail()
  @IsNotEmpty({
    message: 'Email không được để trống',
  })
  email: string;
  @IsString()
  @IsNotEmpty({
    message: 'Mật khẩu không được để trống',
  })
  password: string;
}
