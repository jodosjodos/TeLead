import { ApiProperty } from '@nestjs/swagger';
import { IsEmail, IsNotEmpty, IsString, MinLength } from 'class-validator';

export class CreateUserDto {
  @IsEmail()
  @IsNotEmpty()
  @ApiProperty()
  email: string;
  @IsString()
  @IsNotEmpty()
  @MinLength(4)
  @ApiProperty()
  password: string;
}
