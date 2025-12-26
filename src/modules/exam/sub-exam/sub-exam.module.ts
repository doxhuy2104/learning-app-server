import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { SubExamService } from './sub-exam.service';
import { SubExamController } from './sub-exam.controller';
import { SubExam } from './entities/sub-exam.entity';

@Module({
    imports: [TypeOrmModule.forFeature([SubExam])],
    controllers: [SubExamController],
    providers: [SubExamService],
    exports: [SubExamService],
})
export class SubExamModule { }

