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

  @Get('/account/:id')
  @UseGuards(JwtGuard)
  getAccountDetails(@GetUser() user: User, @Param('id') id: string) {
    return this.service.getAccountDetails(user, id);
  }

  // delete account
  @Delete('delete/:id')
  remove(@Param('id') id: string) {
    return this.service.remove(id);
  }
}
