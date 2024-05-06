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
      if (user.Role != 'STUDENT') {
        throw new BadRequestException(' only student can enroll to courses');
      }
      const course = await this.prisma.course.findUnique({
        where: {
          id: courseId,
        },
      });
      if (!course)
        throw new BadRequestException(' course with that id not found');
      // if (course.paid == 'PAID') {
      //   //TODO: implement stripe for payable course
      //   throw new BadRequestException(' course is paid');
      // }
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
  // get all enrolled students to courses
  async getAllEnrolledStudents(user: User, courseId: string) {
    try {
      return this.prisma.enrollment.findMany({
        where: {
          courseId,
        },
        include: {
          student: {
            select: {
              id: true,
              fullName: true,
              nickName: true,
            },
          },
        },
      });
    } catch (err) {
      throw new InternalServerErrorException(err);
    }
  }

  async updateProgressOrCreateIt(user: User, chapterId: number) {
    try {
      const progress = await this.prisma.chapterProgress.findFirst({
        where: {
          userId: user.id,
          chapterId: chapterId,
        },
      });
      if (progress.completed) {
        throw new BadRequestException(
          ' you have already completed chapter ' + chapterId,
        );
      }
      if (progress) {
        const updatedProgress = await this.prisma.chapterProgress.update({
          where: {
            id: progress.id,
          },
          data: {
            completed: true,
          },
        });
        return {
          msg: ' you have successfully  completed ',
          progress: updatedProgress,
        };
      } else {
        return {
          msg: ' no progress hae initialized by that user with that it ',
        };
      }
    } catch (error) {
      throw new InternalServerErrorException(error);
    }
  }
  async getProgressOfStudent(user: User, courseId: string) {
    if (user.Role == 'MENTOR') {
      throw new BadRequestException(' this  is only for students');
    }
    const courseChapters = await this.prisma.course.findUnique({
      where: {
        id: courseId.trim(),
      },
      select: {
        chapters: {
          select: {
            id: true,
            name: true,
            desc: true,
            chapterProgress: {
              where: {
                userId: user.id,
              },
              select: {
                completed: true,
                progress: true,
                lastAccessed: true,
              },
            },
          },
        },
      },
    });
    if (!courseChapters) {
      throw new BadRequestException(' no course with that id ');
    }
    return {
      msg: 'success return students progress',
      courseChapters: courseChapters,
    };
  }
}
