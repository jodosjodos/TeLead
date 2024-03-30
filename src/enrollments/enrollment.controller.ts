import { Controller, Param, Post, UseGuards } from '@nestjs/common';
import { ApiBearerAuth, ApiOperation, ApiTags } from '@nestjs/swagger';
import { EnrollmentService } from './enrollment.service';
import { Roles } from 'src/decorator/mentor.decorator';
import { GetUser } from 'src/decorator';
import { User } from '@prisma/client';
import { JwtGuard } from 'src/guard';

@ApiTags('enrollment')
@Controller('enrollment')
export class EnrollmentController {
  constructor(private readonly service: EnrollmentService) {}

  @ApiOperation({
    summary: 'Enrollment  student to course',
    description:
      'Enrollment student to course  so that you can track progress ',
  })
  @ApiBearerAuth()
  @Post('/enroll:/courseId')
  @UseGuards(JwtGuard)
  @Roles('STUDENT')
  createEnroll(@GetUser() user: User, @Param('id') courseId: string) {
    return this.service.createEnroll(user, courseId);
  }
}
