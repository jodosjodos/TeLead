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
} from '@nestjs/common';
import { UserService } from './user.service';
import { CreateUserDto } from './dto/create-user.dto';
import { UpdateUserDto } from './dto/update-user.dto';

@Controller('user')
export class UserController {
  constructor(private readonly service: UserService) {}

  @Post('/create')
  create(@Body() createUserDto: CreateUserDto) {
    return this.service.create(createUserDto);
  }
  @HttpCode(HttpStatus.OK)
  @Post('/login')
  login(@Body() loginUserDto: CreateUserDto) {
    return this.service.login(loginUserDto);
  }

  @Patch('verify/:id')
  verifyUser(@Param('id') id: string) {
    return this.service.verifyUser(id);
  }

  @Get()
  findAll() {
    return this.service.findAll();
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.service.findOne(+id);
  }

  @Patch(':id')
  update(@Param('id') id: string, @Body() updateUserDto: UpdateUserDto) {
    return this.service.update(+id, updateUserDto);
  }

  @Delete('delete /:id')
  remove(@Param('id') id: string) {
    return this.service.remove(id);
  }
}
