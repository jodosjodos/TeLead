import { IsNotEmpty, MinLength } from 'class-validator';

export class ResetPasswordDTO {
  @IsNotEmpty()
  @MinLength(4)
  password: string;
  @IsNotEmpty()
  @MinLength(4)
  confirmPassword: string;
}
