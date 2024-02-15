import { BadRequestException, Injectable } from '@nestjs/common';
import { CreateChapterDto, CreateCourseDto } from './dto';
import { DatabaseService } from 'src/database/database.service';
import { User } from '@prisma/client';

@Injectable()
export class CourseService {
  constructor(private readonly prisma: DatabaseService) {}

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
    // check course mentor meet with authorized mentor
    const course = await this.prisma.course.findUnique({
      where: {
        id: courseId,
      },
    });
    if (!course) throw new BadRequestException('No course found with that id');
    if (course.mentorEmail !== user.email)
      throw new BadRequestException(
        "course mentor doesn't not meet with your email",
      );
    const chapter = await this.prisma.chapter.create({
      data: {
        desc: dto.description,
        name: dto.name,
        url: 'mee',//TODO:use cloudinary
      },
    });

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
    });
    console.log(file, dto, course);
  }
}
