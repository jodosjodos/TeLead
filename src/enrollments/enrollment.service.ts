import {
  BadRequestException,
  Injectable,
  InternalServerErrorException,
} from '@nestjs/common';
import { User } from '@prisma/client';
import { DatabaseService } from 'src/database/database.service';

@Injectable()
export class EnrollmentService {
  constructor(private readonly prisma: DatabaseService) {}
  async createEnroll(user: User, courseId: string) {
    try {
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
      return this.initializeProgressTracker(courseId, user.id);
    } catch (error) {
      throw new InternalServerErrorException(error);
    }
  }
  async initializeProgressTracker(courseId: string, userId: string) {
    try {
      const chapters = await this.prisma.chapter.findMany({
        where: {
          courseId,
        },
      });
      if (chapters.length == 0)
        throw new BadRequestException("this course haven't  any chapters yet");
      const progressPromises = chapters.map((chapter) => {
        return this.prisma.chapterProgress.create({
          data: {
            chapterId: chapter.id,
            progress: 0,
            userId,
            completed: false,
          },
        });
      });
      await Promise.all(progressPromises);
      return {
        msg: ' user have  enrolled successfully ',
      };
    } catch (error) {
      throw new InternalServerErrorException(error);
    }
  }
}
