import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { UserModule } from './modules/user/user.module';
import { AuthModule } from './modules/auth/auth.module';
import { AnswerModule } from './modules/answer/answer.module';
import { CourseModule } from './modules/course/course.module';
import { ExamModule } from './modules/exam/exam.module';
import { LessonModule } from './modules/lesson/lesson.module';
import { QuestionModule } from './modules/question/question.module';
import { ParagraphModule } from './modules/paragraph/paragraph.module';
import { ConfigModule } from '@nestjs/config';
import { SubjectModule } from './modules/subject/subject.module';
import { GroupModule } from './modules/group/group.module';
import { SubExamModule } from './modules/sub-exam/sub-exam.module';
import { HistoryModule } from './modules/history/history.module';

@Module({
  imports: [
    ConfigModule.forRoot({
      envFilePath: '.env',
      isGlobal: true,
    }),
    TypeOrmModule.forRoot({
      type: 'postgres',
      host: process.env.DB_HOST || 'localhost',
      port: parseInt(process.env.DB_PORT || '5432'),
      username: process.env.DB_USERNAME || 'postgres',
      password: process.env.DB_PASSWORD || '123456',
      database: process.env.DB_NAME || 'learning_app',
      ssl: {
        rejectUnauthorized: false,
      },
      entities: [__dirname + '/**/*.entity{.ts,.js}'],
      synchronize: process.env.NODE_ENV !== 'production',
      logging: process.env.NODE_ENV === 'development',
    }),
    UserModule,
    AuthModule,
    AnswerModule,
    CourseModule,
    ExamModule,
    LessonModule,
    QuestionModule,
    ParagraphModule,
    SubjectModule,
    GroupModule,
    SubExamModule,
    HistoryModule,
  ],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule { }
