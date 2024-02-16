import { ApiProperty } from '@nestjs/swagger';
import { IsEmail, IsNotEmpty } from 'class-validator';

export class VerifyUserDto {
  @IsEmail()
  @IsNotEmpty()
  @ApiProperty()
  email: string;
}
