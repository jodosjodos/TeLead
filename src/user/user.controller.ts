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
  ParseFilePipeBuilder,
} from '@nestjs/common';
import { UserService } from './user.service';
import { JwtGuard } from 'src/guard';
import { GetUser } from 'src/decorator';
import { User } from '@prisma/client';
import {
  CreateUserDto,
  ResetPasswordDTO,
  UpdateUserDto,
  VerifyUserDto,
} from './dto';
import { FileInterceptor } from '@nestjs/platform-express';
import {
  ApiBearerAuth,
  ApiBody,
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

  // verify account
  //swagger
  @ApiOperation({
    summary: 'verify account',
    description:
      'verify user account using user id and email , the verification url sent to user during creation ',
  })
  @ApiParam({ name: 'id', type: 'string' })
  @ApiParam({
    name: 'email',
    type: 'string',
    description: 'email of the user',
  })
  @ApiResponse({
    status: 200,
    description: 'user have been verified successfully',
  })
  @ApiResponse({
    status: HttpStatus.BAD_REQUEST,
    description: 'user is already verified or  non-match email and id',
  })
  @ApiResponse({
    status: HttpStatus.INTERNAL_SERVER_ERROR,
    description: 'server error',
  })
  // swagger
  @Get('verify/:id/:email')
  verify(
    @Param('id') id: string,
    @Param('email') email: string,
  ): Promise<{ msg: string }> {
    return this.service.verifyUser(id, email);
  }

  // fillProfile
  // swagger
  @ApiOperation({
    summary: 'fill  profile',
    description:
      'updating user profile by overriding default ones and add your true identity ',
  })
  @ApiBody({ type: UpdateUserDto })
  @ApiResponse({
    status: 200,
    description: 'user have been  successfully updated his profile',
  })
  @ApiResponse({
    status: HttpStatus.BAD_REQUEST,
    description: 'not your id or id not much with account',
  })
  @ApiResponse({
    status: HttpStatus.INTERNAL_SERVER_ERROR,
    description: 'server error',
  })
  @ApiBearerAuth()
  // end  swagger
  @UseGuards(JwtGuard)
  @Patch('update/:id')
  @ApiParam({ name: 'id', type: 'string', required: true })
  update(
    @Param('id') id: string,
    @Body() updateUserDto: UpdateUserDto,
    @GetUser() user: User,
  ) {
    return this.service.update(id, updateUserDto, user);
  }

  // swagger
  @ApiOperation({
    summary: 'request reset password via email',
    description: 'send reset password url to your email you have provided',
  })
  @ApiBody({ type: VerifyUserDto })
  @ApiResponse({
    status: 200,
    description: 'reset url have been sent to your email successfully',
  })
  @ApiResponse({
    status: HttpStatus.BAD_REQUEST,
    description: "user with email doesn't exists",
  })
  @ApiResponse({
    status: HttpStatus.INTERNAL_SERVER_ERROR,
    description: 'server error',
  })
  @ApiBearerAuth()
  // end swagger

  // reset password request
  @Get('/resetRequest/email')
  resetPasswordRequest(@Body() email: VerifyUserDto) {
    return this.service.resetPasswordRequest(email);
  }

  // swagger
  @ApiOperation({
    summary: 'reset password ',
    description:
      'user provide new password and confirmPassword so that we can update his password ',
  })
  @ApiParam({ name: 'id', type: 'string' })
  @ApiParam({
    name: 'email',
    type: 'string',
    description: 'email of the user',
  })
  @ApiBody({ type: ResetPasswordDTO })
  @ApiResponse({
    status: 200,
    description: 'password have been updated successfully',
  })
  @ApiResponse({
    status: HttpStatus.BAD_REQUEST,
    description:
      'please provide valid id and email you have received on email or confirm password and password not match',
  })
  @ApiResponse({
    status: HttpStatus.INTERNAL_SERVER_ERROR,
    description: 'server error',
  })
  @ApiBearerAuth()
  //end swagger

  // reset password
  @Patch('/reset/email/:id/:email')
  resetPassword(
    @Param('email') email: string,
    @Param('id') id: string,
    @Body() passwords: ResetPasswordDTO,
  ): Promise<{ msg: string; loginUrl: string }> {
    return this.service.resetPasswordEmail(email, id, passwords);
  }

  // account details
  @Get('/account/:id')
  @UseGuards(JwtGuard)
  getAccountDetails(@GetUser() user: User, @Param('id') id: string) {
    return this.service.getAccountDetails(user, id);
  }

  // upload profile
  @Patch('/upload/profile')
  @UseGuards(JwtGuard)
  @UseInterceptors(FileInterceptor('file'))
  upload(
    @UploadedFile(
      new ParseFilePipeBuilder()

        .addMaxSizeValidator({
          maxSize: 5532403,
        })
        .build({
          errorHttpStatusCode: HttpStatus.UNPROCESSABLE_ENTITY,
        }),
    )
    file: Express.Multer.File,
    @GetUser() user: User,
  ) {
    return this.service.uploadProfile(file, user);
  }

  // delete account
  @Delete('delete/:id')
  remove(@Param('id') id: string) {
    return this.service.remove(id);
  }
}
