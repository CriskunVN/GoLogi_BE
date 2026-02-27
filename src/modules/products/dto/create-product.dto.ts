import { IsNotEmpty, IsString } from 'class-validator';

export class CreateProductDto {
  @IsString()
  @IsNotEmpty({ message: 'Name không được để trống' })
  name: string;
  @IsString()
  description: string;
  @IsString()
  image_url: string;
}
