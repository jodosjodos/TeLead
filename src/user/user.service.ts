import {
  BadRequestException,
  Injectable,
  InternalServerErrorException,
  UnauthorizedException,
} from '@nestjs/common';
import { DatabaseService } from 'src/database/database.service';
import { Gender, User } from '@prisma/client';
import * as argon2 from 'argon2';
// import * as AWS from 'aws-sdk';
import { generateToken } from 'src/util/jwtutil';
import {
  CreateUserDto,
  ResetPasswordDTO,
  UpdateUserDto,
  VerifyUserDto,
} from './dto';
import { EmailService } from 'src/email/email.service';
import { CloudinaryService } from 'src/cloudinary/cloudinary.service';

@Injectable()
export class UserService {
  constructor(
    private readonly prismaService: DatabaseService,
    private readonly emailService: EmailService,
    private readonly cloudinaryService: CloudinaryService,
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

    // send email for verify user
    const confirmUrl = `http://localhost:4000/api/v1/user/verify/${savedUser.id}/${savedUser.email}`;
    await this.emailService.sendEmail(confirmUrl, savedUser);
    return savedUser;
  }

  // verify user profile
  async verifyUser(id: string, email: string) {
    const user = await this.prismaService.user.findUnique({
      where: { id, email },
    });
    if (!user) throw new BadRequestException('non-match email  and id');
    if (user.isVerified)
      throw new BadRequestException(
        ' user with that id have been already verified',
      );
    await this.prismaService.user.update({
      where: { id },
      data: {
        isVerified: true,
      },
    });

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

    if (!user) throw new BadRequestException(' no account with that email ');
    if (!user.isVerified)
      throw new UnauthorizedException('please verify your account');
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
        Role: updateUserDto.role,
      },
    });
    return updatedUser;
  }

  // send reset password request to email
  async resetPasswordRequest(email: VerifyUserDto) {
    const user = await this.prismaService.user.findUnique({
      where: { email: email.email },
    });
    if (!user) throw new BadRequestException(" user with email doesn't exists");
    if (
      user.nickName == 'John' &&
      user.fullName == 'John Doe' &&
      user.phoneNumber == '+250727866254'
    )
      throw new UnauthorizedException('please update your  profile');
    const resetLink = `http://localhost:4000/api/v1/user/reset/email/${user.id}/${user.email}`;

    await this.emailService.sendResetEmail(email, user, resetLink);
    return {
      msg: ' you have requested to reset your password , please check your email',
    };
  }

  // reset password by email
  async resetPasswordEmail(
    email: string,
    id: string,
    passwords: ResetPasswordDTO,
  ) {
    console.log(passwords);

    const user = await this.prismaService.user.findUnique({
      where: { id, email },
    });
    //  check is user is truly him
    if (!user)
      throw new UnauthorizedException(
        'please provide valid id and email you have received on email',
      );

    // check if passwords matches
    if (!(passwords.password === passwords.confirmPassword))
      throw new BadRequestException(' passwords are not match');
    const hashedPassword = await argon2.hash(passwords.password);
    await this.prismaService.user.update({
      where: { id, email },
      data: {
        password: hashedPassword,
      },
    });

    // respond
    return {
      msg: 'to reset your password have been successfully , now you can  login with that password',
      loginUrl: 'localhost:4000/api/v1/user/login',
    };
  }

  async remove(id: string) {
    const deletedUser = await this.prismaService.user.delete({ where: { id } });
    return deletedUser;
  }

  // get profile details
  getAccountDetails(user: User, id: string) {
    if (id == null) throw new BadRequestException('please provide your id');
    if (id !== user.id) throw new BadRequestException(' that is not your id ');

    return { user };
  }

  // upload profile

  async uploadProfile(file: Express.Multer.File, user: User) {
    try {
      // upload
      const uploadResult = await this.cloudinaryService.uploadFile(
        file,
        user.email.replace('@gmail.com', ''),
      );

      // updated profile
      const updatedUser = await this.prismaService.user.update({
        where: {
          id: user.id,
          email: user.email,
        },
        data: {
          profile: uploadResult.secure_url,
        },
      });
      return updatedUser;
    } catch (error) {
      console.error('Error uploading file:', error);
      throw new InternalServerErrorException(error);
    }
  }
}
