import { Module } from '@nestjs/common';
import { AnswerModule } from './answer/answer.module';
import { CourseModule } from './course/course.module';
import { ExamQuestionModule } from './exam-question/exam-question.module';
import { LessonModule } from './lesson/lesson.module';
import { ParagraphModule } from './paragraph/paragraph.module';
import { QuestionModule } from './question/question.module';
import { SubExamModule } from './sub-exam/sub-exam.module';
import { SubjectModule } from './subject/subject.module';

@Module({
  imports: [
    AnswerModule,
    CourseModule,
    ExamQuestionModule,
    LessonModule,
    ParagraphModule,
    QuestionModule,
    SubExamModule,
    SubjectModule,
  ],
})
export class ExamModule {}
