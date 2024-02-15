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

export class CreateCourseDto {
  @IsNotEmpty()
  @IsString()
  courseName: string;

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

  @IsNotEmpty()
  paid: 'FREE' | 'PAID';

  @IsNotEmpty()
  price: string;

  @IsNotEmpty({ message: 'level of your course ' })
  level: 'ALL_LEVELS' | 'BEGINNERS' | 'INTERMEDIATE' | 'EXPERT';
  @IsNotEmpty()
  duration: string;
  @IsArray({ message: 'Features must be an array' })
  @ArrayMinSize(1, { message: 'At least one feature must be provided' })
  @IsEnum(FEATURES, {
    each: true,
    message:
      'Features must be ALL_CAPTION, QUIZZES, CODING_EXERCISES, or PRACTICE_TEST',
  })
  features: FEATURES[];

  @IsNotEmpty({ message: 'provide summary of your course' })
  description: string;
}
