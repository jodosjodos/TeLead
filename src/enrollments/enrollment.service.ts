import { BadRequestException, Injectable } from '@nestjs/common';
import { User } from '@prisma/client';
import { DatabaseService } from 'src/database/database.service';

@Injectable()
export class EnrollmentService {
  constructor(private readonly prisma: DatabaseService) {}
  async createEnroll(user: User, courseId: string) {
    const course = await this.prisma.course.findUnique({
      where: {
        id: courseId,
      },
    });
    if (!course)
      throw new BadRequestException(' course with that id not found');
    const alreadyEnrolled = await this.prisma.enrollment.findFirst({
      where: {
        courseId: course.id,
        studentId: user.id,
      },
    });
    if (alreadyEnrolled)
      throw new BadRequestException(' student already enrolled');
    const unrolledStudent = await this.prisma.enrollment.create({
      data: {
        courseId: course.id,
        studentId: user.id,
      },
    });
    console.log(unrolledStudent);
    return unrolledStudent;
  }
}
