import {
  Body,
  Controller,
  Param,
  Post,
  UploadedFile,
  UseGuards,
  UseInterceptors,
} from '@nestjs/common';
import {
  ApiBearerAuth,
  ApiBody,
  ApiConsumes,
  ApiOperation,
  ApiTags,
} from '@nestjs/swagger';
import { ChaptersService } from './chapters.service';
import { GetUser } from 'src/decorator';
import { CreateChapterDto } from './dto';
import { User } from '@prisma/client';
import { Roles } from 'src/decorator/mentor.decorator';
import { JwtGuard } from 'src/guard';
import { MentorGuard } from 'src/guard/mentor.guard';
import { FileInterceptor } from '@nestjs/platform-express';
@ApiTags('chapters')
@Controller('chapters')
export class ChaptersController {
  constructor(private readonly service: ChaptersService) {}

  @Post('/create/:courseId')
  @ApiBearerAuth()
  @ApiOperation({
    summary: 'Create a new chapter',
    description: 'Create a new chapter',
  })
  @ApiConsumes('multipart/form-data')
  @ApiBody({
    description: 'upload chapter of course',
    type: CreateChapterDto,
  })
  @UseGuards(JwtGuard, MentorGuard)
  @Roles('MENTOR')
  @UseInterceptors(FileInterceptor('file'))
  createChapter(
    @Body() dto: CreateChapterDto,
    @GetUser() user: User,
    @UploadedFile() file: Express.Multer.File,
    @Param('courseId') courseId: string,
  ) {
    return this.service.addChapter(dto, user, file, courseId);
  }
}
