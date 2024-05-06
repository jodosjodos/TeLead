import {
  Controller,
  Get,
  HttpCode,
  HttpStatus,
  Param,
  ParseIntPipe,
  Patch,
  Post,
  UseGuards,
} from '@nestjs/common';
import {
  ApiBearerAuth,
  ApiOperation,
  ApiParam,
  ApiResponse,
  ApiTags,
} from '@nestjs/swagger';
import { EnrollmentService } from './enrollment.service';
import { Roles } from 'src/decorator/mentor.decorator';
import { GetUser } from 'src/decorator';
import { User } from '@prisma/client';
import { JwtGuard } from 'src/guard';
import { MentorGuard } from 'src/guard/mentor.guard';

@ApiTags('enrollment && progress tracking')
@Controller('enrollment')
export class EnrollmentController {
  constructor(private readonly service: EnrollmentService) {}

  // swagger
  @ApiBearerAuth()
  @ApiOperation({
    summary: 'Enrollment  student to course',
    description:
      'Enrollment student to course  so that you can track progress ',
  })
  @ApiResponse({
    status: HttpStatus.OK,
    description: 'Enrollment student to course  successfully',
  })
  @ApiResponse({
    status: HttpStatus.BAD_REQUEST,
    description:
      "student already enrolled, course with id not found , course doesn't have chapters not yet",
  })
  @ApiResponse({
    status: HttpStatus.INTERNAL_SERVER_ERROR,
    description: 'server error',
  })
  @ApiParam({
    name: 'courseId',
    type: 'string',
  })
  // swagger
  @ApiBearerAuth()
  // implementation
  @HttpCode(HttpStatus.OK)
  @Post('/enroll/:courseId')
  @UseGuards(JwtGuard)
  @Roles('STUDENT')
  createEnroll(@GetUser() user: User, @Param('courseId') courseId: string) {
    return this.service.createEnroll(user, courseId);
  }

  @ApiBearerAuth()
  @ApiOperation({
    summary: ' get all Enrolled  students to course',
    description: ' get all students enrolled to  your course ',
  })
  @ApiResponse({
    status: HttpStatus.OK,
    description: '  successfully',
  })
  @ApiResponse({
    status: HttpStatus.INTERNAL_SERVER_ERROR,
    description: 'server error',
  })
  @ApiParam({
    name: 'courseId',
    type: 'string',
  })
  // get all enrolled students on courses done by mentor
  @UseGuards(JwtGuard, MentorGuard)
  @Roles('MENTOR')
  @Get('/enrolls/course/:courseId/students')
  getAllEnrolledStudents(user: User, @Param('courseId') courseId: string) {
    return this.service.getAllEnrolledStudents(user, courseId);
  }

  @ApiBearerAuth()
  @ApiOperation({
    summary: ' make student complete chapter',
    description: ' make student complete chapter',
  })
  @ApiResponse({
    status: HttpStatus.OK,
    description: '  successfully',
  })
  @ApiResponse({
    status: HttpStatus.INTERNAL_SERVER_ERROR,
    description: 'server error',
  })
  @ApiParam({
    name: 'chapterId',
    type: 'string',
  })

  //  keep track of  the completed chapters
  @UseGuards(JwtGuard)
  @Roles('STUDENT')
  @Patch('/enrolls/course/updateProgress/:chapterId')
  updateProgress(
    @GetUser() user: User,
    @Param('chapterId', ParseIntPipe) chapterId: number,
  ) {
    return this.service.updateProgressOrCreateIt(user, chapterId);
  }

  // get progress of student to course
  @ApiBearerAuth()
  @UseGuards(JwtGuard)
  @Roles('STUDENT')
  @Get('/enrolls/course/getProgress/:courseId')
  getProgress(@GetUser() user: User, @Param('courseId') courseId: string) {
    return this.service.getProgressOfStudent(user, courseId);
  }
}
