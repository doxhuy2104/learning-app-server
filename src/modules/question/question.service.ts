import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Question } from './entities/question.entity';
import { CreateQuestionDto } from './dto/create-question.dto';

@Injectable()
export class QuestionService {
    constructor(
        @InjectRepository(Question)
        private questionRepository: Repository<Question>,
    ) { }

    async create(createQuestionDto: CreateQuestionDto): Promise<Question> {
        const question = this.questionRepository.create(createQuestionDto);
        return await this.questionRepository.save(question);
    }

    async findAll(): Promise<Question[]> {
        return await this.questionRepository.find({
            relations: ['exam', 'answers'],
        });
    }

    async findAllPaginated(
        page: number = 1,
        limit: number = 10,
    ): Promise<{
        data: Question[];
        total: number;
        page: number;
        limit: number;
        totalPages: number;
    }> {
        const skip = (page - 1) * limit;
        const [data, total] = await this.questionRepository.findAndCount({
            relations: ['exam', 'answers'],
            skip,
            take: limit,
            order: { id: 'ASC' },
        });

        return {
            data,
            total,
            page,
            limit,
            totalPages: Math.ceil(total / limit),
        };
    }

    async findOne(id: number): Promise<Question | null> {
        return await this.questionRepository.findOne({
            where: { id },
            relations: ['exam', 'answers'],
        });
    }

    async findByExamId(
        examId: number,
        page: number = 1,
        limit: number = 10,
    ): Promise<{
        data: Question[];
        total: number;
        page: number;
        limit: number;
        totalPages: number;
    }> {
        const skip = (page - 1) * limit;
        const [data, total] = await this.questionRepository.findAndCount({
            where: { examId },
            relations: ['answers'],
            order: { orderIndex: 'ASC' },
            skip,
            take: limit,
        });

        return {
            data,
            total,
            page,
            limit,
            totalPages: Math.ceil(total / limit),
        };
    }

    async update(id: number, updateData: Partial<CreateQuestionDto>): Promise<Question | null> {
        await this.questionRepository.update(id, updateData);
        return this.findOne(id);
    }

    async remove(id: number): Promise<void> {
        await this.questionRepository.delete(id);
    }
}

