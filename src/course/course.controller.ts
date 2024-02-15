import { Body, Controller, Post, UseGuards } from '@nestjs/common';
import { Roles } from 'src/decorator/mentor.decorator';
import { JwtGuard } from 'src/guard';
import { MentorGuard } from 'src/guard/mentor.guard';
import { CourseService } from './course.service';
import { CreateCourseDto } from './dto';
import { GetUser } from 'src/decorator';
import { User } from '@prisma/client';

@Controller('course')
export class CourseController {
  constructor(private readonly service: CourseService) {}
  @UseGuards(JwtGuard, MentorGuard)
  @Roles('MENTOR')
  @Post('/create')
  createCourse(@Body() dto: CreateCourseDto, @GetUser() user: User) {
    return this.service.createCourse(dto, user);
  }
}
