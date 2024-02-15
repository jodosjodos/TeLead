import { Injectable } from '@nestjs/common';
import { CreateCourseDto } from './dto';
import { DatabaseService } from 'src/database/database.service';
import { User } from '@prisma/client';

@Injectable()
export class CourseService {
  constructor(private readonly prisma: DatabaseService) {}
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
}
