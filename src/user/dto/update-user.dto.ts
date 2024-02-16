import { ApiProperty } from '@nestjs/swagger';
import { IsDateString, IsNotEmpty, IsString, MinLength } from 'class-validator';

export class UpdateUserDto {
  @IsString()
  @IsNotEmpty()
  @ApiProperty()
  fullName: string;
  @IsString()
  @IsNotEmpty()
  @ApiProperty()
  nickName: string;
  @IsDateString()
  @IsNotEmpty()
  @ApiProperty()
  dateOfBirth: Date;
  @MinLength(8)
  @IsNotEmpty()
  @IsString()
  @ApiProperty()
  phoneNumber: string;
  @IsNotEmpty()
  @ApiProperty({ enum: ['MALE', 'FEMALE'] })
  gender: 'MALE' | 'FEMALE';

  @IsNotEmpty({ message: 'password role must be either MENTOR  or STUDENT' })
  @ApiProperty({ enum: ['MENTOR', 'STUDENT'] })
  role: 'MENTOR' | 'STUDENT';
}
