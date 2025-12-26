import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Exam } from './entities/exam-question.entity';
import { ExamQuestionController } from './exam-question.controller';
import { ExamQuestionService } from './exam-question.service';

@Module({
    imports: [TypeOrmModule.forFeature([Exam])],
    controllers: [ExamQuestionController],
    providers: [ExamQuestionService],
    exports: [ExamQuestionService],
})
export class ExamQuestionModule { }

