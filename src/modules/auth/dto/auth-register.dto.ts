import {
  IsEmail,
  IsNotEmpty,
  IsOptional,
  IsString,
  MinLength,
  Matches,
} from 'class-validator';

export class AuthRegisterDto {
  @IsEmail({}, { message: 'Email không hợp lệ' })
  @IsNotEmpty({ message: 'Email không được để trống' })
  email: string;

  @IsString()
  @IsNotEmpty({ message: 'Password không được để trống' })
  @MinLength(6, { message: 'Password phải có ít nhất 6 ký tự' })
  //   @Matches(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]/, {
  //     message:
  //       'Password phải có ít nhất 1 chữ hoa, 1 chữ thường, 1 số và 1 ký tự đặc biệt',
  //   })
  password: string;

  @IsString()
  @IsOptional()
  fullName?: string;

  @IsOptional()
  @IsString()
  phone?: string;
}
