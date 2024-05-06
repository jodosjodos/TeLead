import { ApiProperty } from '@nestjs/swagger';
import { IsNotEmpty } from 'class-validator';

export class CreateChapterDto {
  @ApiProperty({
    required: true,
  })
  @IsNotEmpty({ message: 'name of chapter must not be empty' })
  name: string;

  @ApiProperty({
    required: true,
  })
  @IsNotEmpty({ message: 'description of chapter must not be empty' })
  description: string;
  @ApiProperty({
    required: true,
    type: 'string',
    format: 'binary',
  })
  file: any;
}
