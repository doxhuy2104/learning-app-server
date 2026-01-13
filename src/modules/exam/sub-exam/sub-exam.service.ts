import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { SubExam } from './entities/sub-exam.entity';
import { CreateSubExamDto } from './dto/create-sub-exam.dto';

@Injectable()
export class SubExamService {
  constructor(
    @InjectRepository(SubExam)
    private examRepository: Repository<SubExam>,
  ) {}

  async create(createExamDto: CreateSubExamDto): Promise<SubExam> {
    const exam = this.examRepository.create(createExamDto);
    return await this.examRepository.save(exam);
  }

  async findAll(): Promise<SubExam[]> {
    return await this.examRepository.find({
      relations: ['questions'],
    });
  }

  async findOne(id: number): Promise<SubExam | null> {
    return await this.examRepository.findOne({
      where: { id },
      relations: ['questions'],
    });
  }

  async findByExamId(examId: number): Promise<SubExam[]> {
    return await this.examRepository.find({
      where: { examId },
      order: { orderIndex: 'ASC' },
    });
  }

  async findByurl(url: string): Promise<SubExam | null> {
    return await this.examRepository.findOne({
      where: { url },
    });
  }

  async update(
    id: number,
    updateData: Partial<CreateSubExamDto>,
  ): Promise<SubExam | null> {
    await this.examRepository.update(id, updateData);
    return this.findOne(id);
  }

  async remove(id: number): Promise<void> {
    await this.examRepository.delete(id);
  }
}
