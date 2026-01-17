import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { AuthModule } from 'src/modules/auth/auth.module';
import { ExamHistory } from 'src/modules/history/entities/exam-history.entity';
import { Exam } from './entities/exam-question.entity';
import { ExamQuestionController } from './exam-question.controller';
import { ExamQuestionService } from './exam-question.service';

@Module({
  imports: [TypeOrmModule.forFeature([Exam, ExamHistory]), AuthModule],
  controllers: [ExamQuestionController],
  providers: [ExamQuestionService],
  exports: [ExamQuestionService],
})
export class ExamQuestionModule { }
