import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { AuthModule } from '../auth/auth.module';
import { Answer } from '../exam/answer/entities/answer.entity';
import { Course } from '../exam/course/entities/course.entity';
import { Exam } from '../exam/exam-question/entities/exam-question.entity';
import { Image } from '../exam/image/entities/image.entity';
import { Lesson } from '../exam/lesson/entities/lesson.entity';
import { Paragraph } from '../exam/paragraph/entities/paragraph.entity';
import { Question } from '../exam/question/entities/question.entity';
import { Subject } from '../exam/subject/entities/subject.entity';
import { Group } from '../group/entities/group.entity';
import { ExamHistory } from '../history/entities/exam-history.entity';
import { UploadModule } from '../upload/upload.module';
import { User } from '../user/entities/user.entity';
import { AdminController } from './admin.controller';
import { AdminService } from './admin.service';

@Module({
  imports: [
    TypeOrmModule.forFeature([
      User,
      Course,
      Lesson,
      Exam,
      Group,
      Subject,
      ExamHistory,
      Question,
      Answer,
      Paragraph,
      Image,
    ]),
    AuthModule,
    UploadModule,
  ],
  controllers: [AdminController],
  providers: [AdminService],
  exports: [AdminService],
})
export class AdminModule { }
