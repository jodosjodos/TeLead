import {
  BadRequestException,
  Injectable,
  UnauthorizedException,
} from '@nestjs/common';
import { DatabaseService } from 'src/database/database.service';
import { Gender, User } from '@prisma/client';
import * as argon2 from 'argon2';
import * as otpGen from 'otp-generator';
// import * as AWS from 'aws-sdk';
import { generateToken } from 'src/util/jwtutil';
import {
  CreateUserDto,
  FillUserDto,
  ResetPasswordDTO,
  UpdateUserDto,
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
  async create(
    createUserDto: CreateUserDto,
  ): Promise<{ user: User; token: string }> {
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
        isVerified: true,
      },
    });

    // send email for verify user
    const confirmUrl = `http://localhost:4000/api/v1/user/verify/${savedUser.id}/${savedUser.email}`;
    await this.emailService.sendEmail(confirmUrl, savedUser);
    const token = await generateToken(savedUser.email, savedUser.id);

    return { user: savedUser, token };
  }

  // login user
  async login(
    createUserDto: CreateUserDto,
  ): Promise<{ user: User; token: string }> {
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
  async update(
    id: string,
    updateUserDto: FillUserDto,
    user: User,
    file: Express.Multer.File,
  ) {
    const uploadResult = await this.cloudinaryService.uploadFile(
      file,
      user.email.replace('@gmail.com', ''),
    );
    const savedUser = await this.prismaService.user.findUnique({
      where: { id: id.trim() },
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
        profile: uploadResult.secure_url,
      },
    });
    return updatedUser;
  }

  // send reset password request to email
  async resetPasswordRequest(email: string) {
    const user = await this.prismaService.user.findUnique({
      where: { email: email.trim() },
    });
    if (!user) throw new BadRequestException(" user with email doesn't exists");

    const otp = await otpGen.generate(4, {
      digits: true,
      upperCaseAlphabets: false,
      specialChars: false,
      lowerCaseAlphabets: false,
    });

    await this.emailService.sendResetEmail(email, user, otp);
    await this.prismaService.oTP.deleteMany({
      where: {
        email,
      },
    });
    await this.prismaService.oTP.create({
      data: {
        email: email.trim(),
        otp: otp.trim(),
        createdAt: new Date(),
      },
    });
    return {
      msg: ' you have requested to reset your password , please check your email',
    };
  }

  // verify otp

  async verifyOTP(
    otp: string,
    email: string,
  ): Promise<{ msg: string; token?: string; userId?: string }> {
    const otpEntry = await this.prismaService.oTP.findFirst({
      where: {
        email: email.trim(),
        otp: otp.trim(),
      },
    });

    if (!otpEntry) {
      throw new BadRequestException('invalid OTP');
    }

    // Calculate the expiration time by adding 5 minutes to the createdAt time
    const expirationTime = new Date(otpEntry.createdAt.getTime() + 5 * 60000);
    const currentTime = new Date();

    if (currentTime > expirationTime) {
      throw new BadRequestException('OTP has expired');
    }

    await this.deleteOTPEntry(otpEntry.id);

    const user = await this.prismaService.user.findUnique({
      where: {
        email,
      },
    });

    if (!user) {
      throw new BadRequestException('User not found');
    }

    const token = await generateToken(user.email, user.id);

    return {
      msg: 'Your OTP is verified',
      token,
      userId: user.id,
    };
  }

  private async deleteOTPEntry(id: number): Promise<void> {
    await this.prismaService.oTP.delete({
      where: {
        id,
      },
    });
  }
  // reset password by email
  async resetPasswordEmail(
    user: User,
    passwords: ResetPasswordDTO,
  ): Promise<{ msg: string; loginUrl: string }> {
    const available = await this.prismaService.user.findUnique({
      where: { id: user.id, email: user.email },
    });
    //  check is user is truly him
    if (!available)
      throw new UnauthorizedException(
        'please provide valid id and email you have received on email',
      );

    // check if passwords matches
    if (!(passwords.password === passwords.confirmPassword))
      throw new BadRequestException(' passwords are not match');
    const hashedPassword = await argon2.hash(passwords.password);
    const isCurrentPassword = await argon2.verify(
      available.password,
      passwords.password,
    );
    if (isCurrentPassword)
      throw new BadRequestException(
        'that is your current password, please choose another password',
      );
    await this.prismaService.user.update({
      where: { id: user.id, email: user.email },
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
    // return deletedUser
    return deletedUser;
  }

  // get profile details
  getAccountDetails(user: User, id: string) {
    if (id == null) throw new BadRequestException('please provide your id');
    if (id !== user.id) throw new BadRequestException(' that is not your id ');
    // return user
    return { user };
  }

  //  get all enrolled course of user

  async getAllEnrolledCourses(user: User) {
    if (user.Role == 'MENTOR')
      throw new BadRequestException('tis  is  only for  students');
    const enrollments = await this.prismaService.enrollment.findMany({
      where: {
        studentId: user.id,
      },
      select: {
        course: true,
      },
    });
    return enrollments;
  }

  //  update profile
  async updateProfile(
    user: User,
    updateProfile: UpdateUserDto,
    file: Express.Multer.File,
  ) {
    console.log(file);
    let uploadedProfile;
    if (file) {
      uploadedProfile = await this.cloudinaryService.uploadFile(
        file,
        user.email.replace('@gmail.com', ''),
      );
    }

    const updatedProfile = await this.prismaService.user.update({
      where: {
        id: user.id,
      },
      data: {
        fullName: updateProfile.fullName,
        nickName: updateProfile.nickName,
        dateOfBirth: updateProfile.dateOfBirth,
        phoneNumber: updateProfile.phoneNumber,
        profile: file ? uploadedProfile.secure_url : uploadedProfile,
      },
    });
    return updatedProfile;
  }
}
