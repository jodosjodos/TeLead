import { ApiProperty } from '@nestjs/swagger';
import {
  ArrayMinSize,
  IsArray,
  IsEnum,
  IsNotEmpty,
  IsString,
} from 'class-validator';

enum FEATURES {
  ALL_CAPTION = 'ALL_CAPTION',
  QUIZZES = 'QUIZZES',
  CODING_EXERCISES = 'CODING_EXERCISES',
  PRACTICE_TEST = 'PRACTICE_TEST',
}
enum PRICE {
  FREE = 'FREE',
  PAID = 'PAID',
}

enum LEVELS {
  ALL_LEVELS = 'ALL_LEVELS',
  BEGINNERS = 'BEGINNERS',
  INTERMEDIATE = 'INTERMEDIATE',
  EXPERT = 'EXPERT',
}

export class CreateCourseDto {
  @ApiProperty()
  @IsNotEmpty()
  @IsString()
  courseName: string;

  @ApiProperty()
  @IsNotEmpty({ message: 'please specify course category' })
  category:
    | 'THREE_DESIGN'
    | 'GRAPHIC_DESIGN'
    | 'WEB_DEVELOPMENT'
    | 'SEO_MARKETING'
    | 'FINANCE_ACCOUNTING'
    | 'PERSONAL_DEVELOPMENT'
    | 'OFFICE_PRODUCTIVITY'
    | 'HR_MANAGEMENT';

  @ApiProperty({
    enum: PRICE,
    enumName: 'paid or free',
  })
  @IsNotEmpty()
  paid: PRICE;

  @ApiProperty()
  @IsNotEmpty()
  price: string;

  @ApiProperty({
    enum: LEVELS,
  })
  @IsNotEmpty({ message: 'level of your course ' })
  level: LEVELS;

  @ApiProperty()
  @IsNotEmpty()
  duration: string;

  @ApiProperty({
    enum: FEATURES,
    isArray: true,
    enumName: 'FEATURES',
  })
  @IsArray({ message: 'Features must be an array' })
  @ArrayMinSize(1, { message: 'At least one feature must be provided' })
  @IsEnum(FEATURES, {
    each: true,
    message:
      'Features must be ALL_CAPTION, QUIZZES, CODING_EXERCISES, or PRACTICE_TEST',
  })
  features: FEATURES[];

  @ApiProperty()
  @IsNotEmpty({ message: 'provide summary of your course' })
  description: string;
}
