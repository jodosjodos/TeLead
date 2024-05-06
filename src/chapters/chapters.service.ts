import {
  BadRequestException,
  Injectable,
  InternalServerErrorException,
} from '@nestjs/common';
import { CloudinaryService } from 'src/cloudinary/cloudinary.service';
import { DatabaseService } from 'src/database/database.service';
import { CreateChapterDto } from './dto';
import { User } from '@prisma/client';

@Injectable()
export class ChaptersService {
  constructor(
    private readonly prisma: DatabaseService,
    private readonly cloud: CloudinaryService,
  ) {}

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
          id: courseId.trim(),
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
}
