import { IsDateString, IsNotEmpty, IsString, MinLength } from 'class-validator';

export class UpdateUserDto {
  @IsString()
  @IsNotEmpty()
  fullName: string;
  @IsString()
  @IsNotEmpty()
  nickName: string;
  @IsDateString()
  @IsNotEmpty()
  dateOfBirth: Date;
  @MinLength(8)
  @IsNotEmpty()
  @IsString()
  phoneNumber: string;
  @IsNotEmpty()
  gender: 'MALE' | 'FEMALE';
}
