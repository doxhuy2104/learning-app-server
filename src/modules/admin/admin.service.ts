import { Injectable, Logger } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import axios from 'axios';
import FormData from 'form-data';
import { In, Repository } from 'typeorm';
import { v4 as uuidv4 } from 'uuid';
import { Course } from '../exam/course/entities/course.entity';
import { Exam } from '../exam/exam-question/entities/exam-question.entity';
import { Lesson } from '../exam/lesson/entities/lesson.entity';
import { Question } from '../exam/question/entities/question.entity';
import { Subject } from '../exam/subject/entities/subject.entity';
import { Group } from '../group/entities/group.entity';
import { ExamHistory } from '../history/entities/exam-history.entity';
import { User } from '../user/entities/user.entity';
import { OcrResultDto } from './dto/ocr-result.dto';

@Injectable()
export class AdminService {
  private readonly logger = new Logger(AdminService.name);

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
    @InjectRepository(Question)
    private readonly questionRepository: Repository<Question>,
  ) {}

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

    const [users, total] = await this.userRepository.findAndCount({
      where: { role: 'USER' },
      relations: ['group'],
      order: { createdAt: 'DESC' },
      skip,
      take: limit,
    });

    const userIds = users.map((u) => u.id);

    const examCounts =
      userIds.length > 0
        ? await this.examHistoryRepository
            .createQueryBuilder('history')
            .select('history.userId', 'userId')
            .addSelect('COUNT(history.id)', 'examCount')
            .where('history.userId IN (:...userIds)', { userIds })
            .groupBy('history.userId')
            .getRawMany<{ userId: number; examCount: string }>()
        : [];

    const examCountMap = new Map(
      examCounts.map((item) => [item.userId, parseInt(item.examCount, 10)]),
    );

    const data = users.map((user) => ({
      ...user,
      examCount: examCountMap.get(user.id) || 0,
    }));

    return {
      page,
      limit,
      total,
      totalPages: Math.ceil(total / limit),
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
      totalPages: Math.ceil(total / limit),
      data,
    };
  }

  async getHistories(page: number = 1, limit: number = 10) {
    const skip = (page - 1) * limit;

    const [histories, total] = await this.examHistoryRepository.findAndCount({
      relations: ['exam'],
      order: { id: 'DESC' },
      skip,
      take: limit,
    });

    const userIds = [...new Set(histories.map((h) => h.userId))];

    const users =
      userIds.length > 0
        ? await this.userRepository.find({
            where: { id: In(userIds) },
            select: ['id', 'email', 'fullName', 'avatar'],
          })
        : [];

    const userMap = new Map(users.map((u) => [u.id, u]));

    const data = histories.map((history) => ({
      ...history,
      user: userMap.get(history.userId) || null,
    }));

    return {
      page,
      limit,
      total,
      totalPages: Math.ceil(total / limit),
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
      totalPages: Math.ceil(total / limit),
      data,
    };
  }

  async getSubjects(page: number = 1, limit: number = 10) {
    const skip = (page - 1) * limit;

    const [data, total] = await this.subjectRepository.findAndCount({
      order: { id: 'ASC' },
      skip,
      take: limit,
    });

    return {
      page,
      limit,
      total,
      totalPages: Math.ceil(total / limit),
      data,
    };
  }

  async getExamsBySubjectId(
    subjectId: number,
    page: number = 1,
    limit: number = 10,
  ) {
    const skip = (page - 1) * limit;

    const [data, total] = await this.examRepository
      .createQueryBuilder('exam')
      .leftJoinAndSelect('exam.lesson', 'lesson')
      .leftJoinAndSelect('lesson.course', 'course')
      .leftJoinAndSelect('course.subject', 'subject')
      .where('course.subjectId = :subjectId', { subjectId })
      .orderBy('exam.id', 'ASC')
      .skip(skip)
      .take(limit)
      .getManyAndCount();

    return {
      page,
      limit,
      total,
      totalPages: Math.ceil(total / limit),
      data,
    };
  }

  async getQuestionsByExamId(examId: number) {
    const data = await this.questionRepository.find({
      where: { examId },
      relations: ['exam', 'answers'],
      order: {
        orderIndex: 'ASC',
        answers: { orderIndex: 'ASC' },
      },
    });

    return {
      total: data.length,
      data,
    };
  }

  async uploadToOcr(file: any, subjectId?: number) {
    const jobId = uuidv4();
    const ocrApiUrl =
      process.env.WSL_TUNNEL_DOMAIN || 'http://localhost:8000/ocr';

    const formData = new FormData();
    formData.append('file', file.buffer, {
      filename: file.originalname,
      contentType: file.mimetype,
    });
    formData.append('job_id', jobId);
    if (subjectId) {
      formData.append('subject_id', subjectId.toString());
    }
    const headers: Record<string, string> = {
      ...formData.getHeaders(),
    };

    const apiKey = process.env.WSL_SHARED_SECRET;
    if (apiKey) {
      headers['x-api-key'] = apiKey;
    }

    try {
      const response = await axios.post(ocrApiUrl, formData, {
        headers,
        maxContentLength: Infinity,
        maxBodyLength: Infinity,
      });

      this.logger.debug(
        `[OCR Upload] OCR API response: ${JSON.stringify(response.data)}`,
      );

      return {
        jobId: jobId,
        accepted: true,
        subjectId: subjectId,
        status: 'submitted',
        ocrApiResponse: response.data,
      };
    } catch (error: any) {
      throw new Error(
        `Failed to upload to OCR API: ${error.response?.data?.detail || error.message}`,
      );
    }
  }

  async handleOcrResult(resultDto: OcrResultDto) {
    this.logger.log(
      `[OCR Callback] Received OCR result - Job ID: ${resultDto.job_id}, Status: ${resultDto.status}`,
    );

    if (resultDto.status === 'done') {
      const ocrTextLength = resultDto.ocr_text?.length || 0;
      this.logger.log(
        `[OCR Callback] OCR completed successfully - Job ID: ${resultDto.job_id}, OCR text length: ${ocrTextLength} characters`,
      );
      if (resultDto.ocr_text) {
        this.logger.debug(
          `[OCR Callback] OCR text preview (first 200 chars): ${resultDto.ocr_text.substring(0, 200)}...`,
        );
      }
    } else if (resultDto.status === 'error') {
      this.logger.error(
        `[OCR Callback] OCR processing failed - Job ID: ${resultDto.job_id}`,
      );
      if (resultDto.stderr_tail) {
        this.logger.error(
          `[OCR Callback] Error details: ${resultDto.stderr_tail}`,
        );
      }
    }

    if (resultDto.stdout_tail) {
      this.logger.debug(`[OCR Callback] Stdout tail: ${resultDto.stdout_tail}`);
    }

    return {
      received: true,
      job_id: resultDto.job_id,
      status: resultDto.status,
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
