import {
  BadRequestException,
  Injectable,
  UnauthorizedException,
} from '@nestjs/common';
import { DatabaseService } from 'src/database/database.service';
import { Gender, User } from '@prisma/client';
import * as argon2 from 'argon2';
import { generateToken } from 'src/util/jwtutil';
import { ConfigService } from '@nestjs/config';
import { CreateUserDto, UpdateUserDto, VerifyUserDto } from './dto';

@Injectable()
export class UserService {
  constructor(
    private readonly prismaService: DatabaseService,
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
    return savedUser;
  }

  // verify user profile
  async verifyUser(id: string, email: VerifyUserDto) {
    const user = await this.prismaService.user.findUnique({
      where: { id, email: email.email },
    });
    if (!user) throw new BadRequestException('non-match email  and id');
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
    console.log(verifiedUser);

    return {
      msg: ' you have verified your email now you can use your account',
    };
  }

  // login user
  async login(createUserDto: CreateUserDto) {
    // check if user already exists
    const user = await this.prismaService.user.findUnique({
      where: { email: createUserDto.email },
    });
    if (!user.isVerified)
      throw new UnauthorizedException('please verify your account');
    if (!user) throw new BadRequestException('Invalid credentials');
    const isPasswordEqual = await argon2.verify(
      user.password,
      createUserDto.password,
    );
    if (!isPasswordEqual) throw new BadRequestException('invalid credentials');

    // generate jwt token
    const token = await generateToken(user.email, user.id);
    return { user: { ...user }, token };
  }

  //  fill profile
  async update(id: string, updateUserDto: UpdateUserDto, user: User) {
    const savedUser = await this.prismaService.user.findUnique({
      where: { id },
    });
    if (!savedUser) throw new BadRequestException('please provide valid id');
    if (id !== user.id) throw new BadRequestException(' that is not your id ');
    const updatedUser = await this.prismaService.user.update({
      where: { id, email: user.email },
      data: {
        fullName: updateUserDto.fullName,
        nickName: updateUserDto.nickName,
        dateOfBirth: updateUserDto.dateOfBirth,
        phoneNumber: updateUserDto.phoneNumber,
        gender: updateUserDto.gender,
      },
    });
    return updatedUser;
  }
  findAll() {
    return `This action returns all user`;
  }

  findOne(id: number) {
    return `This action returns a #${id} user`;
  }

  async remove(id: string) {
    const deletedUser = await this.prismaService.user.delete({ where: { id } });
    return deletedUser;
  }
}
