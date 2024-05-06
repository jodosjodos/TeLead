import { ApiProperty } from '@nestjs/swagger';
import { IsDateString, IsString, MinLength } from 'class-validator';

export class UpdateUserDto {
  @IsString()
  @ApiProperty()
  fullName: string;
  @IsString()
  @ApiProperty()
  nickName: string;
  @IsDateString()
  @ApiProperty()
  dateOfBirth: Date;
  @MinLength(8)
  @IsString()
  @ApiProperty()
  phoneNumber: string;
  @ApiProperty({
    required: true,
    type: 'string',
    format: 'binary',
  })
  file: any;
}
