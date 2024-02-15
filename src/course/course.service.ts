import {
  BadRequestException,
  Injectable,
  InternalServerErrorException,
} from '@nestjs/common';
import { CreateChapterDto, CreateCourseDto } from './dto';
import { DatabaseService } from 'src/database/database.service';
import { User } from '@prisma/client';
import { CloudinaryService } from 'src/cloudinary/cloudinary.service';

@Injectable()
export class CourseService {
  constructor(
    private readonly prisma: DatabaseService,
    private cloud: CloudinaryService,
  ) {}

  // create course
  async createCourse(dto: CreateCourseDto, user: User) {
    const course = await this.prisma.course.create({
      data: {
        courseName: dto.courseName,
        category: dto.category,
        mentorName: user.fullName,
        mentorEmail: user.email,
        rating: '',
        paid: dto.paid,
        price: dto.paid === 'FREE' ? '$0' : dto.price,
        LEVEL: dto.level,
        DURATION: dto.duration,
        features: dto.features,
        description: dto.description,
      },
      include: {
        chapters: true,
      },
    });
    return course;
  }

  // add chapter to course
  async addChapter(
    dto: CreateChapterDto,
    user: User,
    file: Express.Multer.File,
    courseId: string,
  ) {
    try {
      // check course mentor meet with authorized mentor
      const course = await this.prisma.course.findUnique({
        where: {
          id: courseId,
        },
      });
      // when course id doesn't exists or not match
      if (!course)
        throw new BadRequestException('No course found with that id');
      if (course.mentorEmail !== user.email)
        throw new BadRequestException(
          "course mentor doesn't not meet with your email",
        );
      // upload video to cloud
      const res = await this.cloud.uploadVideo(file, dto.name);
      const chapter = await this.prisma.chapter.create({
        data: {
          desc: dto.description,
          name: dto.name,
          url: res.secure_url,
        },
      });

      // include chapter in course
      const updatedCourse = await this.prisma.course.update({
        where: {
          id: courseId,
          mentorEmail: user.email,
        },
        data: {
          chapters: {
            connect: {
              id: chapter.id,
            },
          },
        },
        include: {
          chapters: true,
        },
      });

      // return course with related chapters
      return updatedCourse;
    } catch (err) {
      throw new InternalServerErrorException(err);
    }
  }

  // get sorted course
  async getCourses(user: User) {
    try {
      const sortedRes = await this.prisma.course.findMany({
        where: {
          mentorEmail: user.email,
        },
        orderBy: {
          courseName: 'asc',
        },
        include: {
          chapters: true,
        },
      });
      if (sortedRes.length === 0) {
        throw new BadRequestException('No course created by that mentor');
      }
      return sortedRes;
    } catch (err) {
      throw new InternalServerErrorException(err);
    }
  }
}
