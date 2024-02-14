import { Controller, Post, UseGuards } from '@nestjs/common';
import { Roles } from 'src/decorator/mentor.decorator';
import { JwtGuard } from 'src/guard';
import { MentorGuard } from 'src/guard/mentor.guard';

@Controller('course')
export class CourseController {
  @UseGuards(JwtGuard, MentorGuard)
  @Roles('MENTOR')
  @Post('/create')
  createCourse() {
    return 'reaching out';
  }
}
