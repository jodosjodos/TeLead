import { BadRequestException, Injectable } from '@nestjs/common';
import { CreateUserDto } from './dto/create-user.dto';
import { UpdateUserDto } from './dto/update-user.dto';
import { DatabaseService } from 'src/database/database.service';
import { Gender } from '@prisma/client';
import { EmailService } from 'src/email/email.service';

@Injectable()
export class UserService {
  constructor(
    private readonly prismaService: DatabaseService,
    private readonly emailService: EmailService,
  ) {}
  async create(createUserDto: CreateUserDto) {
    const user = await this.prismaService.user.findUnique({
      where: { email: createUserDto.email },
    });

    //  check if user already exists
    if (user)
      throw new BadRequestException(
        'user with this email already exists , please login',
      );

    // save user
    const defaultDateOfBirth = new Date('2006-01-01T00:00:00Z');
    const savedUser = await this.prismaService.user.create({
      data: {
        email: createUserDto.email,
        password: createUserDto.password,
        fullName: 'John Doe',
        phoneNumber: '+250727866254',
        nickName: 'John',
        dateOfBirth: defaultDateOfBirth,
        gender: Gender.MALE,
      },
    });

    // don't send email
    // await this.emailService.sendEmail(confirmUrl, createUserDto);
    // const confirmUrl = `http://localhost:4000/api/v1/users/confirm/${savedUser.id}`;
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
