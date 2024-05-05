import { ApiProperty } from '@nestjs/swagger';
import { IsNotEmpty, IsString, MinLength } from 'class-validator';

export class FillUserDto {
  @IsString()
  @IsNotEmpty()
  @ApiProperty()
  fullName: string;
  @IsString()
  @IsNotEmpty()
  @ApiProperty()
  nickName: string;
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
  @ApiProperty({
    required: true,
    type: 'file',
    format: 'binary',
  })
  file: any;
}
