import {
  Body,
  Controller,
  Param,
  Patch,
  Post,
  UploadedFile,
  UseGuards,
  UseInterceptors,
} from '@nestjs/common';
import { Roles } from 'src/decorator/mentor.decorator';
import { JwtGuard } from 'src/guard';
import { MentorGuard } from 'src/guard/mentor.guard';
import { CourseService } from './course.service';
import { CreateChapterDto, CreateCourseDto } from './dto';
import { GetUser } from 'src/decorator';
import { User } from '@prisma/client';
import { FileInterceptor } from '@nestjs/platform-express';

@Controller('course')
export class CourseController {
  constructor(private readonly service: CourseService) {}

  // create course without chapter
  @UseGuards(JwtGuard, MentorGuard)
  @Roles('MENTOR')
  @Post('/create')
  createCourse(@Body() dto: CreateCourseDto, @GetUser() user: User) {
    return this.service.createCourse(dto, user);
  }

  // add chapters in course
  @UseGuards(JwtGuard, MentorGuard)
  @Roles('MENTOR')
  @Patch('/create/chapter/:courseId')
  @UseInterceptors(FileInterceptor('file'))
  createChapter(
    @Body() dto: CreateChapterDto,
    @GetUser() user: User,
    @UploadedFile() file: Express.Multer.File,
    @Param('courseId') courseId: string,
  ) {
    return this.service.addChapter(dto, user, file, courseId);
  }
}
