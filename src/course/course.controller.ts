import {
  Body,
  Controller,
  Get,
  Param,
  Patch,
  Post,
  Query,
  UploadedFile,
  UseGuards,
  UseInterceptors,
} from '@nestjs/common';
import { Roles } from 'src/decorator/mentor.decorator';
import { JwtGuard } from 'src/guard';
import { MentorGuard } from 'src/guard/mentor.guard';
import { CourseService } from './course.service';
import { CreateChapterDto, CreateCourseDto, FilterDto } from './dto';
import { GetUser } from 'src/decorator';
import { Course, User } from '@prisma/client';
import { FileInterceptor } from '@nestjs/platform-express';
import { ApiTags } from '@nestjs/swagger';
@ApiTags('course')
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

  // get all courses
  @UseGuards(JwtGuard, MentorGuard)
  @Roles('MENTOR')
  @Get('/all')
  getAllCourses(
    @GetUser() user: User,
  ): Promise<{ res: Course[]; count: number }> {
    return this.service.getCourses(user);
  }

  // get all courses ascending
  @UseGuards(JwtGuard, MentorGuard)
  @Roles('MENTOR')
  @Get('/all/sort')
  getAllCourseSort(@GetUser() user: User): Promise<Course[]> {
    return this.service.getCoursesSorted(user);
  }

  // get single course
  @UseGuards(JwtGuard, MentorGuard)
  @Roles('MENTOR')
  @Get('/single/:id')
  getSingleCourse(
    @GetUser() user: User,
    @Param('id') id: string,
  ): Promise<Course> {
    return this.service.getOneCourse(user, id);
  }

  // filter
  // if features included include more than one
  @UseGuards(JwtGuard)
  @Get('/filter')
  getFilteredCourse(
    @GetUser() user: User,
    @Query() dto: FilterDto,
  ): Promise<Course[]> {
    return this.service.filteredCourse(user, dto);
  }

  // pagination
  @UseGuards(JwtGuard, MentorGuard)
  @Roles('MENTOR')
  @Get('/all/paginate')
  getCoursesPaginate(
    @Query('page') pages = 1,
    @Query('perPage') perPage = 10,
    @GetUser() user: User,
  ): Promise<Course[]> {
    return this.service.getCoursesPaginated(user, +pages, +perPage);
  }
}
