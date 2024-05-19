import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  HttpCode,
  HttpStatus,
  UseGuards,
  UseInterceptors,
  UploadedFile,
} from '@nestjs/common';
import { UserService } from './user.service';
import { JwtGuard } from 'src/guard';
import { GetUser } from 'src/decorator';
import { User } from '@prisma/client';
import {
  CreateUserDto,
  FillUserDto,
  ResetPasswordDTO,
  UpdateUserDto,
} from './dto';
import { FileInterceptor } from '@nestjs/platform-express';
import {
  ApiBearerAuth,
  ApiBody,
  ApiConsumes,
  ApiExcludeEndpoint,
  ApiOperation,
  ApiParam,
  ApiResponse,
  ApiTags,
} from '@nestjs/swagger';

@ApiTags('user')
@Controller('user')
export class UserController {
  constructor(private readonly service: UserService) {}

  // register
  @Post('/create')
  @ApiResponse({
    status: HttpStatus.CREATED,
    description: 'user have been created successfully',
  })
  @ApiResponse({
    status: HttpStatus.BAD_REQUEST,
    description: 'user with that email already exists',
  })
  @ApiResponse({
    status: HttpStatus.INTERNAL_SERVER_ERROR,
    description: 'internal server error ',
  })
  @ApiOperation({
    summary: 'register  user',
    description: ' this is endpoint to register user to TeLead',
  })
  @ApiBody({ type: CreateUserDto })
  @HttpCode(HttpStatus.CREATED)
  create(@Body() createUserDto: CreateUserDto) {
    return this.service.create(createUserDto);
  }

  // login
  @HttpCode(HttpStatus.OK)
  @Post('/login')
  // swagger
  @ApiOperation({
    summary: 'login',
    description: 'login to get credentials of your account ',
  })
  @ApiBody({ type: CreateUserDto })
  @ApiResponse({
    status: 200,
    description: 'login successfully',
  })
  @ApiResponse({
    status: HttpStatus.BAD_REQUEST,
    description: 'no account found with that email or invalid credentials',
  })
  @ApiResponse({
    status: HttpStatus.UNAUTHORIZED,
    description: 'Please verify your account and try again',
  })
  @ApiResponse({
    status: HttpStatus.INTERNAL_SERVER_ERROR,
    description: 'server error',
  })
  // down swagger
  login(
    @Body() loginUserDto: CreateUserDto,
  ): Promise<{ user: User; token: string }> {
    return this.service.login(loginUserDto);
  }

  // fillProfile
  // swagger
  @Patch('/fillProfile/:id')
  @ApiOperation({
    summary: 'fill profile ',
    description: 'fill profile',
  })
  @ApiResponse({
    status: 200,
    description: 'user  have success filled profile',
  })
  @ApiResponse({
    status: HttpStatus.BAD_REQUEST,
    description: 'invalid credentials or  invalid inputs',
  })
  @ApiResponse({
    status: HttpStatus.INTERNAL_SERVER_ERROR,
    description: 'server error',
  })
  @ApiConsumes('multipart/form-data')
  @ApiBody({
    description: 'fillProfile profile ',
    type: FillUserDto,
    required: true,
  })
  @ApiBearerAuth()
  @UseGuards(JwtGuard)
  @UseInterceptors(FileInterceptor('file'))
  @HttpCode(HttpStatus.OK)
  fillProfile(
    @GetUser() user: User,
    @Body() fillProfile: FillUserDto,
    @UploadedFile() file: Express.Multer.File,
    @Param('id') userId: string,
  ) {
    return this.service.update(userId, fillProfile, user, file);
  }

  // swagger
  @ApiOperation({
    summary: 'request reset password via email',
    description: 'send reset  otp validation',
  })
  @ApiResponse({
    status: 200,
    description: 'reset  otp have been sent',
  })
  @ApiResponse({
    status: HttpStatus.BAD_REQUEST,
    description: "user with email doesn't exists",
  })
  @ApiResponse({
    status: HttpStatus.INTERNAL_SERVER_ERROR,
    description: 'server error',
  })
  // end swagger

  // reset password request
  @Get('/resetRequest/:email')
  resetPasswordRequest(@Param('email') email: string) {
    return this.service.resetPasswordRequest(email);
  }

  // swagger
  @ApiOperation({
    summary: 'verify OTP ',
    description: 'user  verify OTP based on one he has received on   email',
  })
  @ApiParam({
    name: 'email',
    type: 'string',
    description: 'email of the user',
  })
  @ApiParam({ name: 'otp', type: 'string', description: 'received otp ' })
  @ApiResponse({
    status: 200,
    description: ' otp validation successfully',
  })
  @ApiResponse({
    status: HttpStatus.BAD_REQUEST,
    description:
      'please provide valid otp and email you have received on email ',
  })
  @ApiResponse({
    status: HttpStatus.INTERNAL_SERVER_ERROR,
    description: 'server error',
  })
  //end swagger
  @Get('/reset/verify/otp/:email/:otp')
  verifyOTP(@Param('email') email: string, @Param('otp') otp: string) {
    return this.service.verifyOTP(otp, email);
  }

  // reset password
  @ApiBearerAuth()
  @UseGuards(JwtGuard)
  @Patch('/reset/newPasswords')
  resetPassword(
    @GetUser() user: User,
    @Body() passwords: ResetPasswordDTO,
  ): Promise<{ msg: string; loginUrl: string }> {
    return this.service.resetPasswordEmail(user, passwords);
  }

  // account details
  // swagger conf

  @ApiOperation({
    summary: 'get account details',
    description: 'this return all details of specific user ',
  })
  @ApiParam({
    name: 'id',
    type: 'string',
    required: true,
    description: 'user id ',
  })
  @ApiResponse({
    status: 200,
    description: 'return user details',
  })
  @ApiResponse({
    status: HttpStatus.BAD_REQUEST,
    description: 'no null id  or id not match with account',
  })
  @ApiResponse({
    status: HttpStatus.INTERNAL_SERVER_ERROR,
    description: 'server error',
  })
  @ApiBearerAuth()

  // end swagger conf
  @Get('/account/:id')
  @UseGuards(JwtGuard)
  getAccountDetails(@GetUser() user: User, @Param('id') id: string) {
    return this.service.getAccountDetails(user, id);
  }

  // get all  courses user have enrolled in
  @ApiOperation({
    summary: 'get  all courses user have enrolled in',
    description: 'get all courses user have enrolled in',
  })
  @ApiResponse({
    status: 200,
    description: 'return all enrolled courses user have enrolled in',
  })
  @ApiResponse({
    status: HttpStatus.BAD_REQUEST,
    description: 'user must be student not mentor',
  })
  @ApiResponse({
    status: HttpStatus.INTERNAL_SERVER_ERROR,
    description: 'server error',
  })
  @ApiBearerAuth()
  @UseGuards(JwtGuard)
  @Get('/courses')
  getAllEnrolledCourses(@GetUser() user: User) {
    return this.service.getAllEnrolledCourses(user);
  }
  @Patch('/updateProfile')
  @ApiConsumes('multipart/form-data')
  @ApiOperation({
    summary: 'update profile ',
    description: 'update profile',
  })
  @ApiResponse({
    status: 200,
    description: 'user  have updated profile',
  })
  @ApiResponse({
    status: HttpStatus.BAD_REQUEST,
    description: 'invalid credentials or  invalid inputs',
  })
  @ApiResponse({
    status: HttpStatus.INTERNAL_SERVER_ERROR,
    description: 'server error',
  })
  @ApiBody({
    description: 'update profile ',
    type: UpdateUserDto,
    required: true,
  })
  @ApiBearerAuth()
  @UseGuards(JwtGuard)
  @UseInterceptors(FileInterceptor('file'))
  updateProfile(
    @GetUser() user: User,
    @Body() updateProfile: UpdateUserDto,
    @UploadedFile() file: Express.Multer.File,
  ) {
    return this.service.updateProfile(user, updateProfile, file);
  }
  @ApiExcludeEndpoint()
  // delete account
  //TODO:not done yet
  @Delete('delete/:id')
  remove(@Param('id') id: string) {
    // call delete service
    return this.service.remove(id);
  }
}
