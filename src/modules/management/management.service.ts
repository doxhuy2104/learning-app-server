import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Course } from '../exam/course/entities/course.entity';
import { Exam } from '../exam/exam-question/entities/exam-question.entity';
import { Lesson } from '../exam/lesson/entities/lesson.entity';
import { Subject } from '../exam/subject/entities/subject.entity';
import { Group } from '../group/entities/group.entity';
import { ExamHistory } from '../history/entities/exam-history.entity';
import { User } from '../user/entities/user.entity';

@Injectable()
export class ManagementService {
    constructor(
        @InjectRepository(User)
        private readonly userRepository: Repository<User>,
        @InjectRepository(Course)
        private readonly courseRepository: Repository<Course>,
        @InjectRepository(Lesson)
        private readonly lessonRepository: Repository<Lesson>,
        @InjectRepository(Exam)
        private readonly examRepository: Repository<Exam>,
        @InjectRepository(Group)
        private readonly groupRepository: Repository<Group>,
        @InjectRepository(Subject)
        private readonly subjectRepository: Repository<Subject>,
        @InjectRepository(ExamHistory)
        private readonly examHistoryRepository: Repository<ExamHistory>,
    ) { }

    async getOverview() {
        const [
            totalUsers,
            activeUsers,
            verifiedUsers,
            totalCourses,
            totalLessons,
            totalExams,
            totalGroups,
            totalSubjects,
            totalExamHistories,
            avgScore,
        ] = await Promise.all([
            this.userRepository.count(),
            this.userRepository.count({ where: { isActive: true } }),
            this.userRepository.count({ where: { isVerified: true } }),
            this.courseRepository.count(),
            this.lessonRepository.count(),
            this.examRepository.count(),
            this.groupRepository.count(),
            this.subjectRepository.count(),
            this.examHistoryRepository.count(),
            this.getAverageExamScore(),
        ]);

        return {
            message: 'Management overview',
            status: 'ok',
            timestamp: new Date().toISOString(),
            totals: {
                users: totalUsers,
                activeUsers,
                verifiedUsers,
                courses: totalCourses,
                lessons: totalLessons,
                exams: totalExams,
                groups: totalGroups,
                subjects: totalSubjects,
                examHistories: totalExamHistories,
            },
            analytics: {
                averageExamScore: avgScore,
            },
        };
    }

    async getUsers(page: number = 1, limit: number = 10) {
        const skip = (page - 1) * limit;

        const [data, total] = await this.userRepository.findAndCount({
            where: { role: 'USER' },
            relations: ['group'],
            order: { createdAt: 'DESC' },
            skip,
            take: limit,
        });

        return {
            page,
            limit,
            total,
            data,
        };
    }

    async getExams(page: number = 1, limit: number = 10) {
        const skip = (page - 1) * limit;

        const [data, total] = await this.examRepository.findAndCount({
            relations: ['lesson', 'lesson.course'],
            order: { id: 'DESC' },
            skip,
            take: limit,
        });

        return {
            page,
            limit,
            total,
            data,
        };
    }

    async getHistories(page: number = 1, limit: number = 10) {
        const skip = (page - 1) * limit;

        const [data, total] = await this.examHistoryRepository.findAndCount({
            relations: ['exam'],
            order: { id: 'DESC' },
            skip,
            take: limit,
        });

        return {
            page,
            limit,
            total,
            data,
        };
    }

    async getCourses(page: number = 1, limit: number = 10) {
        const skip = (page - 1) * limit;

        const [data, total] = await this.courseRepository.findAndCount({
            relations: ['subject'],
            order: { id: 'DESC' },
            skip,
            take: limit,
        });

        return {
            page,
            limit,
            total,
            data,
        };
    }

    private async getAverageExamScore(): Promise<number | null> {
        const result = await this.examHistoryRepository
            .createQueryBuilder('history')
            .select('AVG(history.score)', 'avg')
            .where('history.score IS NOT NULL')
            .getRawOne<{ avg: string | null }>();

        if (!result || result.avg === null) {
            return null;
        }

        return Number(result.avg);
    }
}


