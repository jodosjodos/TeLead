import { ApiPropertyOptional } from '@nestjs/swagger';
import { IsDateString, IsOptional, IsString, MinLength } from 'class-validator';

export class UpdateUserDto {
  @IsString()
  @ApiPropertyOptional()
  @IsOptional()
  fullName: string;
  @IsString()
  @ApiPropertyOptional()
  @IsOptional()
  nickName: string;
  @IsDateString()
  @ApiPropertyOptional()
  @IsOptional()
  dateOfBirth: Date;
  @MinLength(8)
  @IsString()
  @ApiPropertyOptional()
  @IsOptional()
  phoneNumber: string;

  @ApiPropertyOptional({
    required: true,
    type: 'string',
    format: 'binary',
  })
  file: any;
}
// 