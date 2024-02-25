import {
  BadRequestException,
  Injectable,
  InternalServerErrorException,
} from '@nestjs/common';
import { CreateChapterDto, CreateCourseDto, FilterDto } from './dto';
import { DatabaseService } from 'src/database/database.service';
import { Course, User } from '@prisma/client';
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
    // return created course
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

  // get all coursers unsorted
  async getCourses(user: User): Promise<{ res: Course[]; count: number }> {
    try {
      const res = await this.prisma.course.findMany({
        where: {
          mentorEmail: user.email,
        },
      });
      if (res.length === 0) {
        throw new BadRequestException('No course created by that mentor');
      }

      return { res: res, count: res.length };
    } catch (err) {
      throw new InternalServerErrorException(err);
    }
  }

  // get sorted course
  async getCoursesSorted(user: User): Promise<Course[]> {
    try {
      const sortedRes = await this.prisma.course.findMany({
        where: {
          mentorEmail: user.email,
        },
        orderBy: {
          courseName: 'asc',
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

  // get single course
  async getOneCourse(user: User, id: string): Promise<Course> {
    try {
      const course = await this.prisma.course.findUnique({
        where: {
          id: id,
          mentorEmail: user.email,
        },
        include: {
          chapters: true,
        },
      });
      if (!course)
        throw new BadRequestException(
          'no course found created by that mentor and have that id ',
        );
      return course;
    } catch (err) {
      throw new InternalServerErrorException(err);
    }
  }

  // get courses filtered
  async filteredCourse(user: User, dto: FilterDto) {
    //  features must more than 1
    try {
      if (dto.features && dto.features.length > 0) {
        const filteredCourses = await this.prisma.course.findMany({
          where: {
            mentorEmail: user.email,
            category: dto.category,
            LEVEL: dto.level,
            paid: dto.payType,
            features: { hasSome: dto.features },
          },
        });

        if (filteredCourses.length === 0) {
          throw new BadRequestException(
            'unmatched course or no course created by that mentor ',
          );
        }

        return filteredCourses;
      } else {
        const filteredCourses = await this.prisma.course.findMany({
          where: {
            mentorEmail: user.email,
            category: dto.category,
            LEVEL: dto.level,
            paid: dto.payType,
          },
        });

        if (filteredCourses.length === 0) {
          throw new BadRequestException(
            'unmatched course or no course created by that mentor ',
          );
        }

        return filteredCourses;
      }
    } catch (err) {
      throw new InternalServerErrorException(err);
    }
  }

  // pagination
  async getCoursesPaginated(user: User, page = 1, perPage = 10) {
    try {
      const totalCourses = await this.prisma.course.findMany({
        where: {
          mentorEmail: user.email,
        },
      });

      if (totalCourses.length < perPage) return totalCourses;
      const totalPages = totalCourses.length / perPage;
      if (page > totalPages)
        throw new BadRequestException('no more records for you ');
      const paginatedCourses = await this.prisma.course.findMany({
        where: {
          mentorEmail: user.email,
        },
        skip: (page - 1) * perPage,
        take: perPage,
      });
      if (paginatedCourses.length === 0) {
        throw new BadRequestException('no course created by that mentor ');
      }
      return paginatedCourses;
    } catch (err) {
      throw new InternalServerErrorException(err);
    }
  }
}
