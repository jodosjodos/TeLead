import { ArrayMinSize, IsEnum, IsOptional, IsString } from 'class-validator';

enum CATEGORY {
  THREE_DESIGN = 'THREE_DESIGN',
  GRAPHIC_DESIGN = 'GRAPHIC_DESIGN',
  WEB_DEVELOPMENT = 'WEB_DEVELOPMENT',
  SEO_MARKETING = 'SEO_MARKETING',
  FINANCE_ACCOUNTING = 'FINANCE_ACCOUNTING',
  PERSONAL_DEVELOPMENT = 'PERSONAL_DEVELOPMENT',
  OFFICE_PRODUCTIVITY = 'OFFICE_PRODUCTIVITY',
  HR_MANAGEMENT = 'HR_MANAGEMENT',
}

enum LEVELS {
  ALL_LEVELS = 'ALL_LEVELS',
  BEGINNERS = 'BEGINNERS',
  INTERMEDIATE = 'INTERMEDIATE',
  EXPERT = 'EXPERT',
}

enum FEATURES {
  ALL_CAPTION = 'ALL_CAPTION',
  QUIZZES = 'QUIZZES',
  CODING_EXERCISES = 'CODING_EXERCISES',
  PRACTICE_TEST = 'PRACTICE_TEST',
}

enum PAYTYPE {
  PAID = 'PAID',
  FREE = 'FREE',
}

export class FilterDto {
  @IsOptional()
  @IsEnum(CATEGORY)
  category?: CATEGORY;
  @IsOptional()
  @IsEnum(LEVELS)
  level?: LEVELS;
  @IsOptional()
  @IsEnum(FEATURES, { each: true })
  @ArrayMinSize(1, { message: 'At least one feature must be provided' })
  features?: FEATURES[];
  @IsOptional()
  @IsString({ each: true })
  payType?: PAYTYPE;
}
