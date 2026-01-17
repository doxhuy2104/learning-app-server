import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { In, Repository } from 'typeorm';
import { CreateExamDto } from './dto/create-exam-question.dto';
import { Exam } from './entities/exam-question.entity';

import { ExamHistory } from 'src/modules/history/entities/exam-history.entity';

@Injectable()
export class ExamQuestionService {
  constructor(
    @InjectRepository(Exam)
    private examRepository: Repository<Exam>,
    @InjectRepository(ExamHistory)
    private examHistoryRepository: Repository<ExamHistory>,
  ) { }

  async create(createExamDto: CreateExamDto): Promise<Exam> {
    const exam = this.examRepository.create(createExamDto);
    return await this.examRepository.save(exam);
  }

  async findAll(userId?: number): Promise<Exam[]> {
    const exams = await this.examRepository.find({
      relations: ['lesson', 'questions'],
      order: { orderIndex: 'ASC' },
    });

    if (userId) {
      await this.attachHistories(exams, userId);
    }
    return exams;
  }

  async findOne(id: number, userId?: number): Promise<Exam | null> {
    const exam = await this.examRepository.findOne({
      where: { id },
      relations: ['lesson', 'questions'],
    });

    if (exam && userId) {
      await this.attachHistories([exam], userId);
    }
    return exam;
  }

  async findByLessonId(lessonId: number, userId?: number): Promise<Exam[]> {
    const exams = await this.examRepository.find({
      where: { lessonId },
      relations: ['lesson.course.subject'],
      order: { orderIndex: 'ASC' },
    });

    if (userId) {
      await this.attachHistories(exams, userId);
    }

    return exams;
  }

  async findByCourseId(courseId: number, userId?: number): Promise<Exam[]> {
    const exams = await this.examRepository.find({
      where: { courseId },
      order: { orderIndex: 'ASC' },
    });

    if (userId) {
      await this.attachHistories(exams, userId);
    }

    return exams;
  }

  async findBySubjectId(subjectId: number, userId?: number): Promise<Exam[]> {
    const exams = await this.examRepository.find({
      where: { subjectId },
      order: { orderIndex: 'ASC' },
    });

    if (userId) {
      await this.attachHistories(exams, userId);
    }

    return exams;
  }

  private async attachHistories(exams: Exam[], userId: number) {
    if (exams.length === 0) return;

    const examIds = exams.map(e => e.id);

    const histories = await this.examHistoryRepository.find({
      where: {
        userId,
        examId: In(examIds),
      },
      order: { id: 'DESC' }
    });

    const historyMap = new Map<number, ExamHistory[]>();

    for (const history of histories) {
      if (!historyMap.has(history.examId)) {
        historyMap.set(history.examId, []);
      }
      historyMap.get(history.examId)?.push(history);
    }

    for (const exam of exams) {
      exam.histories = historyMap.get(exam.id) || [];
    }
  }

  async findByurl(url: string): Promise<Exam | null> {
    return await this.examRepository.findOne({
      where: { url },
    });
  }

  async update(
    id: number,
    updateData: Partial<CreateExamDto>,
  ): Promise<Exam | null> {
    await this.examRepository.update(id, updateData);
    return this.findOne(id);
  }

  async remove(id: number): Promise<void> {
    await this.examRepository.delete(id);
  }
}
