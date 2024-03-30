import {
  Controller,
  HttpCode,
  HttpStatus,
  Param,
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

  // implementation
  @HttpCode(HttpStatus.OK)
  @Post('/enroll/:courseId')
  @UseGuards(JwtGuard)
  @Roles('STUDENT')
  createEnroll(@GetUser() user: User, @Param('courseId') courseId: string) {
    return this.service.createEnroll(user, courseId);
  }
}
