import { IsEmail, IsNotEmpty, IsString } from 'class-validator';

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
  @IsEmail()
  @IsNotEmpty()
  mentor: string;
  @IsNotEmpty()
  paid: 'FREE' | 'PAID';
  //TODO:check type of  paid chosen
  price: string;
  @IsNotEmpty({ message: 'level of your course ' })
  level: 'ALL_LEVELS' | 'BEGINNERS' | 'INTERMEDIATE' | 'EXPERT';
  @IsNotEmpty({ message: 'length of course is required' })
  duration: string;
  // TODO:check provided features
  @IsNotEmpty({ message: ' please provide features of your course' })
  features: string[];
  @IsNotEmpty({ message: 'provide summary of your course' })
  description: string;
  chapters: chapter[];
}

type chapter = {
  id: string;
  desc: string;
  url: string;
};
