import { ApiProperty } from '@nestjs/swagger';
import { IsNotEmpty, MinLength } from 'class-validator';

export class ResetPasswordDTO {
  @IsNotEmpty()
  @MinLength(4)
  @ApiProperty()
  password: string;
  @IsNotEmpty()
  @MinLength(4)
  @ApiProperty()
  confirmPassword: string;
}
