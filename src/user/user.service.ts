import { BadRequestException, Injectable } from '@nestjs/common';
import { CreateUserDto } from './dto/create-user.dto';
import { UpdateUserDto } from './dto/update-user.dto';
import { DatabaseService } from 'src/database/database.service';
import { Gender } from '@prisma/client';

@Injectable()
export class UserService {
  constructor(private readonly prismaService: DatabaseService) {}
  async create(createUserDto: CreateUserDto) {
    const user = await this.prismaService.user.findUnique({
      where: { email: createUserDto.email },
    });
    if (user)
      throw new BadRequestException(
        'user with this email already exists , please login',
      );

    const savedUser = await this.prismaService.user.create({
      data: {
        email: createUserDto.email,
        password: createUserDto.password,
        fullName: 'John Doe',
        phoneNumber: '+250727866254',
        nickName: 'John',
        dateOfBirth: '',
        gender: Gender.MALE,
      },
    });
    return savedUser;
  }

  findAll() {
    return `This action returns all user`;
  }

  findOne(id: number) {
    return `This action returns a #${id} user`;
  }

  update(id: number, updateUserDto: UpdateUserDto) {
    console.log(updateUserDto);

    return `This action updates a #${id} user`;
  }

  remove(id: number) {
    return `This action removes a #${id} user`;
  }
}
