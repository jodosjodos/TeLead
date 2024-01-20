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
import { CreateUserDto, UpdateUserDto, VerifyUserDto } from './dto';

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
  @Get('/reset')
  resetPassword(@Body() email: VerifyUserDto) {
    return this.service.resetPassword(email);
  }

  // delete account
  @Delete('delete/:id')
  remove(@Param('id') id: string) {
    return this.service.remove(id);
  }
}
