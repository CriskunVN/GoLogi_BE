import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import * as bcrypt from 'bcrypt';
import { CreateUserDto } from './dto/create-user.dto';
import { UpdateUserDto } from './dto/update-user.dto';
import { User } from '../../entities/user.entity';

@Injectable()
export class UserService {
  constructor(
    @InjectRepository(User)
    private userRepository: Repository<User>,
  ) {}

  async create(createUserDto: CreateUserDto): Promise<User> {
    // Hash password trước khi lưu vào DB
    const saltRounds = 10; // Số vòng hash (10 là đủ tốt và nhanh)
    const hashedPassword = await bcrypt.hash(
      createUserDto.password,
      saltRounds,
    );

    const user = this.userRepository.create({
      ...createUserDto,
      password: hashedPassword, // Thay password gốc bằng password đã hash
    });

    return await this.userRepository.save(user);
  }

  async findAll(): Promise<User[]> {
    return await this.userRepository.find();
  }

  async findOne(id: string): Promise<User | null> {
    return await this.userRepository.findOne({ where: { id } });
  }

  async update(id: string, updateUserDto: UpdateUserDto): Promise<User | null> {
    // Nếu có cập nhật password, phải hash lại
    if (updateUserDto.password) {
      const saltRounds = 10;
      updateUserDto.password = await bcrypt.hash(
        updateUserDto.password,
        saltRounds,
      );
    }

    await this.userRepository.update(id, updateUserDto);
    return await this.findOne(id);
  }

  // Method để verify password khi login
  async validatePassword(
    plainPassword: string,
    hashedPassword: string,
  ): Promise<boolean> {
    return await bcrypt.compare(plainPassword, hashedPassword);
  }

  // Method tìm user theo email (dùng cho login)
  async findByEmail(email: string): Promise<User | null> {
    return await this.userRepository.findOne({
      where: { email },
      select: [
        'id',
        'email',
        'password',
        'fullName',
        'phone',
        'isActive',
        'createdAt',
        'updatedAt',
      ], // Phải select password để verify
    });
  }

  async remove(id: string): Promise<void> {
    await this.userRepository.delete(id);
  }
}
