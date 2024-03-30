import {
  Body,
  Controller,
  Get,
  HttpStatus,
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
import {
  ApiBearerAuth,
  ApiBody,
  ApiConsumes,
  ApiOperation,
  ApiResponse,
  ApiTags,
} from '@nestjs/swagger';
@ApiTags('course')
@Controller('course')
export class CourseController {
  constructor(private readonly service: CourseService) {}

  // create course without chapter
  @Post('/create')

  // swagger
  @ApiOperation({
    summary: 'Create a new course',
    description: 'Create a new course',
  })
  @ApiResponse({
    status: HttpStatus.CREATED,
    description: 'The course have been created',
  })
  @ApiBearerAuth()
  @ApiBody({ type: CreateCourseDto })
  // end of swagger
  @UseGuards(JwtGuard, MentorGuard)
  @Roles('MENTOR')
  createCourse(@Body() dto: CreateCourseDto, @GetUser() user: User) {
    return this.service.createCourse(dto, user);
  }

  // add chapters in course
  @Patch('/create/chapter/:courseId')

  // swagger
  @ApiBearerAuth()
  @ApiOperation({
    summary: 'Create a new chapter',
    description: 'Create a new chapter',
  })
  @ApiConsumes('multipart/form-data')
  @ApiBody({
    description: 'upload chapter of course',
    type: CreateChapterDto,
  })
  @UseGuards(JwtGuard, MentorGuard)
  @Roles('MENTOR')
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
  @ApiBearerAuth()
  @ApiOperation({
    summary: 'Get all courses',
    description: 'Get all courses  created by mentor',
  })
  @UseGuards(JwtGuard, MentorGuard)
  @Roles('MENTOR')
  @Get('/all')
  getAllCourses(
    @GetUser() user: User,
  ): Promise<{ res: Course[]; count: number }> {
    return this.service.getCourses(user);
  }

  // get all courses ascending
  @ApiBearerAuth()
  @ApiOperation({
    summary: 'Get all courses ascending',
    description: 'Get all courses  created by mentor asc',
  })
  @UseGuards(JwtGuard, MentorGuard)
  @Roles('MENTOR')
  @Get('/all/sort')
  getAllCourseSort(@GetUser() user: User): Promise<Course[]> {
    return this.service.getCoursesSorted(user);
  }

  // get single course
  @ApiBearerAuth()
  @ApiOperation({
    summary: 'Get single course',
    description: 'Get single course details',
  })
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
  @ApiBearerAuth()
  @ApiOperation({
    summary: 'Filter courses',
    description: 'get filtered courses',
  })
  @UseGuards(JwtGuard)
  @Get('/filter')
  getFilteredCourse(
    @GetUser() user: User,
    @Query() dto: FilterDto,
  ): Promise<Course[]> {
    return this.service.filteredCourse(user, dto);
  }

  // pagination
  @ApiBearerAuth()
  @ApiOperation({
    summary: 'Get all courses',
    description: 'Get all courses  created by mentor and do pagination',
  })
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
