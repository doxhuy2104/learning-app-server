import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { AuthModule } from '../auth/auth.module';
import { Course } from '../exam/course/entities/course.entity';
import { Exam } from '../exam/exam-question/entities/exam-question.entity';
import { Lesson } from '../exam/lesson/entities/lesson.entity';
import { Subject } from '../exam/subject/entities/subject.entity';
import { Group } from '../group/entities/group.entity';
import { ExamHistory } from '../history/entities/exam-history.entity';
import { User } from '../user/entities/user.entity';
import { ManagementController } from './management.controller';
import { ManagementService } from './management.service';

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
        ]),
        AuthModule,
    ],
    controllers: [ManagementController],
    providers: [ManagementService],
    exports: [ManagementService],
})
export class ManagementModule { }


