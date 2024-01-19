import { BadRequestException, Injectable } from '@nestjs/common';
import { CreateUserDto } from './dto/create-user.dto';
import { UpdateUserDto } from './dto/update-user.dto';
import { DatabaseService } from 'src/database/database.service';
import { Gender } from '@prisma/client';
import { EmailService } from 'src/email/email.service';
import * as argon2 from 'argon2';
import { generateToken } from 'src/util/jwtutil';
import { ConfigService } from '@nestjs/config';

@Injectable()
export class UserService {
  constructor(
    private readonly prismaService: DatabaseService,
    private readonly emailService: EmailService,
    private readonly config: ConfigService,
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
    const hashedPassword = await argon2.hash(createUserDto.password);
    const savedUser = await this.prismaService.user.create({
      data: {
        email: createUserDto.email,
        password: hashedPassword,
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

  // verify user profile
  async verifyUser(id: string) {
    const user = await this.prismaService.user.findUnique({ where: { id } });
    if (!user) throw new BadRequestException('Invalid id');
    if (user.isVerified)
      throw new BadRequestException(
        ' user with that id have been already verified',
      );
    const verifiedUser = await this.prismaService.user.update({
      where: { id },
      data: {
        isVerified: true,
      },
    });
    return verifiedUser;
  }

  async login(createUserDto: CreateUserDto) {
    const user = await this.prismaService.user.findUnique({
      where: { email: createUserDto.email },
    });
    if (!user) throw new BadRequestException('Invalid credentials');
    const isPasswordEqual = await argon2.verify(
      user.password,
      createUserDto.password,
    );
    if (!isPasswordEqual) throw new BadRequestException('invalid credentials');

    const token = await generateToken(user.email, user.id);
    return { user: { ...user }, token };
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

  async remove(id: string) {
    const deletedUser = await this.prismaService.user.delete({ where: { id } });
    return deletedUser;
  }
}
