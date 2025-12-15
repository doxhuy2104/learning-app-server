import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, In } from 'typeorm';
import { ExamHistory } from './entities/exam-history.entity';
import { UserAnswer } from './entities/user-answer.entity';
import { CreateExamHistoryDto } from './dto/create-exam-history.dto';
import { UpdateExamHistoryDto } from './dto/update-exam-history.dto';
import { CreateUserAnswerDto } from './dto/create-user-answer.dto';
import { SubmitExamDto } from './dto/submit-exam.dto';
import { Answer } from '../answer/entities/answer.entity';

@Injectable()
export class HistoryService {
    constructor(
        @InjectRepository(ExamHistory)
        private examHistoryRepository: Repository<ExamHistory>,
        @InjectRepository(UserAnswer)
        private userAnswerRepository: Repository<UserAnswer>,
        @InjectRepository(Answer)
        private answerRepository: Repository<Answer>,
    ) { }

    async create(createExamHistoryDto: CreateExamHistoryDto): Promise<ExamHistory> {
        const examHistory = this.examHistoryRepository.create({
            ...createExamHistoryDto,
        });
        return await this.examHistoryRepository.save(examHistory);
    }


    async findOne(id: number): Promise<ExamHistory> {
        const examHistory = await this.examHistoryRepository.findOne({
            where: { id },
            relations: ['userAnswers'],
        });

        if (!examHistory) {
            throw new NotFoundException(`Exam History with ID ${id} not found`);
        }

        return examHistory;
    }

    async findByUserId(userId: number): Promise<ExamHistory[]> {
        return await this.examHistoryRepository.find({
            where: { userId },
            relations: ['exam', 'userAnswers'],
            order: { id: 'DESC' },
        });
    }

    async findByExamId(examId: number): Promise<ExamHistory[]> {
        return await this.examHistoryRepository.find({
            where: { examId },
            relations: ['user', 'userAnswers'],
            order: { id: 'DESC' },
        });
    }

    async findByUserAndExam(
        userId: number,
        examId: number,
    ): Promise<ExamHistory[]> {
        return await this.examHistoryRepository.find({
            where: { userId, examId },
            relations: ['exam', 'userAnswers'],
            order: { id: 'DESC' },
        });
    }

    async update(
        id: number,
        updateExamHistoryDto: UpdateExamHistoryDto,
    ): Promise<ExamHistory> {
        const updateData: any = { ...updateExamHistoryDto };

        if (updateExamHistoryDto.endTime) {
            updateData.endTime = new Date(updateExamHistoryDto.endTime);
        }
        if (updateExamHistoryDto.submitTime) {
            updateData.submitTime = new Date(updateExamHistoryDto.submitTime);
        }

        await this.examHistoryRepository.update(id, updateData);
        return this.findOne(id);
    }

    async remove(id: number): Promise<void> {
        const History = await this.findOne(id);
        await this.examHistoryRepository.remove(History);
    }

    async createUserAnswer(
        createUserAnswerDto: CreateUserAnswerDto,
    ): Promise<UserAnswer> {
        const userAnswer = this.userAnswerRepository.create(createUserAnswerDto);
        return await this.userAnswerRepository.save(userAnswer);
    }

    async submitExam(
        submitExamDto: SubmitExamDto,
        userId: number,
    ): Promise<ExamHistory> {
        const {
            historyId,
            examId,
            timeSpent,
            score,
            answers,
        } = submitExamDto;

        // 1. Create history if not provided
        let examHistory: ExamHistory;
        if (historyId) {
            examHistory = await this.findOne(historyId);
        } else {
            const historyPayload: Partial<ExamHistory> = {
                userId,
                examId,
            };
            examHistory = await this.examHistoryRepository.save(
                this.examHistoryRepository.create(historyPayload),
            );
        }

        // 2. Prepare user answers from client (no server grading)
        const userAnswersToSave: UserAnswer[] = answers.map((a) =>
            this.userAnswerRepository.create({
                historyId: examHistory.id,
                examId: examHistory.examId,
                questionOrderIndex: a.questionOrderIndex,
                answerOrderIndex: a.answerOrderIndex,
                shortAnswer: a.shortAnswer,
                trueFalseAnswer: a.trueFalseAnswer,
                isCorrect: a.isCorrect,
                score: a.score ?? 0,
            }),
        );

        await this.userAnswerRepository.save(userAnswersToSave);

        // 3. Update history with client-provided status/score/timestamps
        const updateHistory: Partial<ExamHistory> = {};
        if (score !== undefined) updateHistory.score = score;
        if (timeSpent !== undefined) updateHistory.timeSpent = timeSpent;

        if (Object.keys(updateHistory).length > 0) {
            await this.examHistoryRepository.update(examHistory.id, updateHistory);
        }

        return this.findOne(examHistory.id);
    }

    async getUserAnswersByHistoryId(historyId: number): Promise<UserAnswer[]> {
        return await this.userAnswerRepository.find({
            where: { historyId },
        });
    }
}

