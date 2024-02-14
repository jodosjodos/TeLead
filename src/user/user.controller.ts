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
import { ApiTags } from '@nestjs/swagger';

@ApiTags('user')
@Controller('user')
export class UserController {
  constructor(private readonly service: UserService) {}

  // register
  @Post('/create')
  create(@Body() createUserDto: CreateUserDto) {
    return this.service.create(createUserDto);
  }

  // login
  @HttpCode(HttpStatus.OK)
  @Post('/login')
  login(@Body() loginUserDto: CreateUserDto) {
    return this.service.login(loginUserDto);
  }

  // verify account
  @Get('verify/:id/:email')
  verifyUser(@Param('id') id: string, @Param('email') email: string) {
    return this.service.verifyUser(id, email);
  }

  // fillProfile
  @UseGuards(JwtGuard)
  @Patch('update/:id')
  update(
    @Param('id') id: string,
    @Body() updateUserDto: UpdateUserDto,
    @GetUser() user: User,
  ) {
    return this.service.update(id, updateUserDto, user);
  }

  // reset password request
  @Get('/resetRequest/email')
  resetPasswordRequest(@Body() email: VerifyUserDto) {
    return this.service.resetPasswordRequest(email);
  }

  // process reset request
  @Patch('/reset/email/:id/:email')
  resetPassword(
    @Param('email') email: string,
    @Param('id') id: string,
    @Body() passwords: ResetPasswordDTO,
  ) {
    return this.service.resetPasswordEmail(email, id, passwords);
  }

  // account details
  @Get('/account/:id')
  @UseGuards(JwtGuard)
  getAccountDetails(@GetUser() user: User, @Param('id') id: string) {
    return this.service.getAccountDetails(user, id);
  }

  //TODO:Not done yet
  // upload profile
  @Patch('/upload/profile')
  @UseGuards(JwtGuard)
  @UseInterceptors(FileInterceptor('file'))
  uploadProfile(
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
