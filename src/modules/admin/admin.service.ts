import { Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { InjectRepository } from '@nestjs/typeorm';
import axios from 'axios';
import { In, Repository } from 'typeorm';
import { v4 as uuidv4 } from 'uuid';
import { Answer } from '../exam/answer/entities/answer.entity';
import { Course } from '../exam/course/entities/course.entity';
import { Exam } from '../exam/exam-question/entities/exam-question.entity';
import { Image as ExamImage } from '../exam/image/entities/image.entity';
import { Lesson } from '../exam/lesson/entities/lesson.entity';
import { Paragraph } from '../exam/paragraph/entities/paragraph.entity';
import { Question } from '../exam/question/entities/question.entity';
import { Subject } from '../exam/subject/entities/subject.entity';
import { Group } from '../group/entities/group.entity';
import { ExamHistory } from '../history/entities/exam-history.entity';
import { UploadService } from '../upload/upload.service';
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
    @InjectRepository(Paragraph)
    private readonly paragraphRepository: Repository<Paragraph>,
    @InjectRepository(Answer)
    private readonly answerRepository: Repository<Answer>,
    @InjectRepository(ExamImage)
    private readonly imageRepository: Repository<ExamImage>,
    private readonly uploadService: UploadService,
    private readonly configService: ConfigService,
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

    // const [data, total] = await this.examRepository
    //   .createQueryBuilder('exam')
    //   .leftJoinAndSelect('exam.lesson', 'lesson')
    //   .leftJoinAndSelect('lesson.course', 'course')
    //   .leftJoinAndSelect('course.subject', 'subject')
    //   .where('course.subjectId = :subjectId', { subjectId })
    //   .orderBy('exam.id', 'ASC')
    //   .skip(skip)
    //   .take(limit)
    //   .getManyAndCount();

    const [data, total] = await this.examRepository.findAndCount({
      order: { id: 'DESC' },
      where: { subjectId },
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

  async getQuestionsByExamId(examId: number) {
    const data = await this.questionRepository.find({
      where: { examId },
      relations: ['exam', 'answers'],
      order: {
        orderIndex: 'ASC',
        id: 'ASC',
        answers: { orderIndex: 'ASC' },
      },
    });

    return {
      total: data.length,
      data,
    };
  }

  async uploadToOcr(fileName: string, subjectId?: number) {
    const jobId = uuidv4();
    const ocrApiUrl =
      process.env.WSL_TUNNEL_DOMAIN || 'http://localhost:8000/ocr';

    const payload = {
      file_name: fileName,
      job_id: jobId,
      ...(subjectId && { subject_id: subjectId }),
    };

    const headers: Record<string, string> = {
      'Content-Type': 'application/json',
    };

    const apiKey = process.env.WSL_SHARED_SECRET;
    if (apiKey) {
      headers['x-api-key'] = apiKey;
    }

    this.logger.log(`[OCR Upload] Sending request to ${ocrApiUrl} with payload: ${JSON.stringify(payload)}`);

    try {
      const response = await axios.post(ocrApiUrl, payload, {
        headers,
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
      const errorDetail = error.response?.data
        ? JSON.stringify(error.response.data)
        : error.message;
      this.logger.error(`[OCR Upload] Failed to upload to OCR API: ${errorDetail}`);
      throw new Error(`Failed to upload to OCR API: ${errorDetail}`);
    }
  }

  async handleOcrResult(resultDto: OcrResultDto) {
    this.logger.log(
      `[OCR Callback] Received OCR result - File: ${resultDto.file_name}, Work Item ID: ${resultDto.work_item_id}, Status: ${resultDto.status}`,
    );

    if (resultDto.status === 'done') {
      this.logger.log(
        `[OCR Callback] OCR completed successfully - File: ${resultDto.file_name}, Work Item ID: ${resultDto.work_item_id}`,
      );

      try {
        const fileName = resultDto.file_name;
        // Construct S3 key from filename. Assuming structure: workspace/markdown/pdf/{filename_no_ext}.md
        // Example: file.pdf -> workspace/markdown/pdf/file.md
        const baseName = fileName.replace(/\.[^/.]+$/, "");
        const mdKey = `workspace/markdown/pdf/${baseName}.md`;

        this.logger.log(`[OCR Callback] Fetching markdown from S3 key: ${mdKey}`);

        const content = await this.uploadService.getFileContent(mdKey);

        if (content) {
          await this.processOcrContent(content, fileName, resultDto.work_item_id);
          this.logger.log(`[OCR Callback] Successfully processed OCR content for ${fileName}`);
        } else {
          this.logger.warn(`[OCR Callback] No content found for key: ${mdKey}`);
        }

      } catch (error) {
        this.logger.error(`[OCR Callback] Failed to process OCR content: ${error.message}`, error.stack);
        // Do not throw, just log, so we return received: true
      }

    } else if (resultDto.status === 'error') {
      this.logger.error(
        `[OCR Callback] OCR processing failed - File: ${resultDto.file_name}, Work Item ID: ${resultDto.work_item_id}`,
      );
      if (resultDto.stderr_tail) {
        this.logger.error(
          `[OCR Callback] Error details: ${resultDto.stderr_tail}`,
        );
      }
    }

    return {
      received: true,
      file_name: resultDto.file_name,
      work_item_id: resultDto.work_item_id,
      status: resultDto.status,
    };
  }

  private async processOcrContent(content: string, fileName: string, workItemId: string) {
    const newExam = this.examRepository.create({
      title: fileName,
      duration: 90, // Default duration
      totalQuestions: 0,
      subjectId: 1,
    });

    const savedExam = await this.examRepository.save(newExam);

    const bucketName = this.configService.get<string>('AWS_BUCKET_NAME');
    const region = this.configService.get<string>('AWS_REGION');
    let processedContent = content;

    // Process Images
    try {
      const imagePrefix = `image/${workItemId}/`;
      this.logger.log(`[OCR Processing] Checking for images in prefix: ${imagePrefix}`);

      const imageKeys = await this.uploadService.getFolderContent(imagePrefix);
      let images: { key: string; url: string; pageIndex: number; sequence: number; name: string }[] = [];

      if (imageKeys && imageKeys.length > 0) {
        this.logger.log(`[OCR Processing] Found ${imageKeys.length} images.`);

        // Prepare list for replacement logic and saving
        images = imageKeys.map(key => {
          const name = key.split('/').pop() || '';
          // Match page{index}_{sequence}_...
          const match = name.match(/page(\d+)_(\d+)_/);
          const pageIndex = match ? parseInt(match[1], 10) : -1;
          const sequence = match ? parseInt(match[2], 10) : -1;
          return {
            key,
            url: `https://${bucketName}.s3.${region}.amazonaws.com/${key}`,
            pageIndex,
            sequence,
            name
          };
        }).sort((a, b) => {
          if (a.pageIndex !== b.pageIndex) {
            return a.pageIndex - b.pageIndex;
          }
          return a.sequence - b.sequence;
        });

        // Save images to DB
        const examImages = images.map(img => this.imageRepository.create({
          url: img.url,
          examId: savedExam.id,
        }));
        await this.imageRepository.save(examImages);

        // Fetch JSONL for page mapping
        const jsonlKey = `workspace/results/output_${workItemId}.jsonl`;
        const jsonlContent = await this.uploadService.getFileContent(jsonlKey);

        if (jsonlContent) {
          try {
            const jsonlData = JSON.parse(jsonlContent);
            const pdfPageNumbers: [number, number, number][] = jsonlData?.attributes?.pdf_page_numbers || [];
            // Use original content for offset calculation but verify it matches 'text' in JSONL?
            // We trust 'content' passed here corresponds to 'text' in JSONL as they come from same source.

            const fullText = content;

            // Find all placeholders ![...] (page_...)
            const placeholderRegex = /!\[.*?\]\((page_\d+_\d+_\d+_\d+\.png)\)/g;
            let match;
            const replacements: { start: number, end: number, url: string }[] = [];
            const imageCursorByPage: Record<number, number> = {};

            while ((match = placeholderRegex.exec(fullText)) !== null) {
              const start = match.index;
              const end = start + match[0].length;

              // Find page number for this offset
              const pageInfo = pdfPageNumbers.find(p => start >= p[0] && start < p[1]);

              if (pageInfo) {
                const pageNum = pageInfo[2]; // 1-based
                const pageIndex = pageNum - 1; // 0-based to match image filename "page0_..."

                const pageImages = images.filter(img => img.pageIndex === pageIndex);

                if (!imageCursorByPage[pageIndex]) imageCursorByPage[pageIndex] = 0;
                const cursor = imageCursorByPage[pageIndex];

                if (cursor < pageImages.length) {
                  const imgToUse = pageImages[cursor];
                  imageCursorByPage[pageIndex]++;
                  replacements.push({ start, end, url: `![Image](${imgToUse.url})` });
                }
              }
            }

            // Apply replacements
            replacements.sort((a, b) => b.start - a.start);

            for (const rep of replacements) {
              processedContent = processedContent.substring(0, rep.start) + rep.url + processedContent.substring(rep.end);
            }

          } catch (e) {
            this.logger.error(`[OCR Processing] Failed to parse JSONL or replace images: ${e.message}`);
          }
        }
      } else {
        this.logger.log(`[OCR Processing] No images found.`);
      }
    } catch (error) {
      this.logger.error(`[OCR Processing] Failed to process images: ${error.message}`);
    }

    let totalQuestions = 0;

    const normalizedContent = processedContent.replace(/\r\n/g, '\n');

    // Find indices of parts PHẦN I, PHẦN II, PHẦN III
    const partRegex = /PHẦN\s+(I|II|III)(?:\.|:|\s)/g;
    let match;
    const partsIndices: { index: number, type: string }[] = [];

    while ((match = partRegex.exec(normalizedContent)) !== null) {
      const numeral = match[1];
      let type = 'choice';
      if (numeral === 'I') type = 'choice';
      else if (numeral === 'II') type = 'true_false';
      else if (numeral === 'III') type = 'short_answer';

      partsIndices.push({ index: match.index, type });
    }

    // this.logger.log(partsIndices);

    if (partsIndices.length === 0) {
      totalQuestions += await this.parseQuestionsSection(normalizedContent, 'choice', savedExam.id, 0);
    } else {
      for (let i = 0; i < partsIndices.length; i++) {
        const currentPart = partsIndices[i];
        const nextPart = partsIndices[i + 1];
        const start = currentPart.index;
        const end = nextPart ? nextPart.index : normalizedContent.length;
        const sectionContent = normalizedContent.substring(start, end);

        totalQuestions += await this.parseQuestionsSection(sectionContent, currentPart.type, savedExam.id, totalQuestions);
      }
    }

    await this.examRepository.update(savedExam.id, { totalQuestions });
  }

  private async parseQuestionsSection(content: string, type: string, examId: number, startIndex: number): Promise<number> {
    this.logger.log(content);
    // Split by "Câu <number>."
    // Regex: \nCâu\s+\d+[\.:]
    const questionSplitRegex = /\nCâu\s+\d+[\.:]/g;

    // Need to capture the "Câu X" part to keep it or just split
    // Let's iterate matches to get start/end

    const questions: { start: number, label: string }[] = [];
    let match;
    while ((match = questionSplitRegex.exec(content)) !== null) {
      questions.push({ start: match.index, label: match[0].trim() });
    }

    let count = 0;

    for (let i = 0; i < questions.length; i++) {
      const q = questions[i];
      const nextQ = questions[i + 1];
      const end = nextQ ? nextQ.start : content.length;

      // Content includes "Câu X. ..."
      let qContent = content.substring(q.start, end).trim();
      // Remove the "Câu X." prefix from content if desired, or keep it.
      // Usually keep it in 'content' to preserve context, or remove it. 
      // The label "Câu 1." is useful. let's keep it.

      const currentOrder = startIndex + count + 1;

      if (type === 'choice') {
        await this.saveChoiceQuestion(qContent, examId, currentOrder);
        count++;
      } else if (type === 'true_false') {
        // For T/F, checking if it has sub-parts a,b,c,d
        await this.saveTrueFalseQuestion(qContent, examId, currentOrder);
        // One parent question or 4 sub questions?
        // Implementation detail in saveTrueFalseQuestion
        count++;
      } else if (type === 'short_answer') {
        await this.saveShortAnswerQuestion(qContent, examId, currentOrder);
        count++;
      }
    }
    return count;
  }

  async getImagesByExamId(examId: number) {
    return await this.imageRepository.find({
      where: { examId },
    });
  }

  async deleteExam(id: number) {
    return await this.examRepository.delete(id);
  }

  private async saveChoiceQuestion(rawContent: string, examId: number, orderIndex: number) {
    // Extract Options A, B, C, D
    // Naive approach: find last occurrence of "A.", "B.", etc.
    // But options can be multiline.

    // Regex for options: \n[A-D][\.\)]\s
    // Or just [A-D][\.\)]\s if they are inline.

    // Let's assume options are at the end.
    // We'll try to split by option keys.

    // Pattern:
    // Content...
    // A. Option A
    // B. Option B
    // ...

    // Find indexes of A., B., C., D.
    // Be careful of false positives.

    const optionRegex = /(?:\n|^|\s)([A-D])[\.\)]/g;
    const options: { key: string, index: number }[] = [];

    let match;
    while ((match = optionRegex.exec(rawContent)) !== null) {
      options.push({ key: match[1], index: match.index });
    }

    // Filter options: valid sequence A, B, C, D?
    // Sometimes only A, B, C, D present.
    // Simple logic: if we have 4 matches distinct A, B, C, D, take them.

    let questionText = rawContent;
    const finalOptions: { key: string, content: string }[] = [];

    if (options.length >= 4) {
      // Take the last 4 that form A, B, C, D set?
      // Or just take found options.
      // Let's assume the LAST usage of A, B, C, D are the options (in case "A" appears in text).
      // Actually, 'A.' is rare in text.

      // Let's try to extract from the first found "A." that starts a sequence.
      const startA = options.find(o => o.key === 'A');
      if (startA) {
        questionText = rawContent.substring(0, startA.index).trim();

        // Now parsing options
        // We need to slice the string.
        // But we need the indices of B, C, D relative to A.

        const relevantOptions = options.filter(o => o.index >= startA.index);

        for (let i = 0; i < relevantOptions.length; i++) {
          const opt = relevantOptions[i];
          const nextOpt = relevantOptions[i + 1];
          const optEnd = nextOpt ? nextOpt.index : rawContent.length;
          // +2 for "A." or "A)" length approx
          const optContent = rawContent.substring(opt.index + 2, optEnd).trim().replace(/^[\.\)]\s*/, '');
          finalOptions.push({ key: opt.key, content: `${opt.key}. ${optContent}` });
        }
      }
    }

    const question = this.questionRepository.create({
      content: questionText,
      type: 'choice',
      dataType: 'md',
      examId,
      orderIndex,
    });
    const savedQ = await this.questionRepository.save(question);

    if (finalOptions.length > 0) {
      const answers = finalOptions.map(o => this.answerRepository.create({
        content: o.content,
        dataType: 'md',
        questionId: savedQ.id,
        isCorrect: false, // Cannot determine from OCR
      }));
      await this.answerRepository.save(answers);
    }
  }

  private async saveTrueFalseQuestion(rawContent: string, examId: number, orderIndex: number) {
    // Structure: Câu X. Stem... a) ... b) ...
    // Extract Stem and a,b,c,d

    const subItemRegex = /(?:\n|^|\s)([a-d])[\.\)]/g;
    const subItems: { key: string, index: number }[] = [];
    let match;
    while ((match = subItemRegex.exec(rawContent)) !== null) {
      subItems.push({ key: match[1], index: match.index });
    }

    let stem = rawContent;
    const parsedSubItems: { key: string, content: string }[] = [];

    if (subItems.length > 0) {
      const firstItem = subItems[0];
      stem = rawContent.substring(0, firstItem.index).trim();

      for (let i = 0; i < subItems.length; i++) {
        const item = subItems[i];
        const nextItem = subItems[i + 1];
        const end = nextItem ? nextItem.index : rawContent.length;

        // Use full match logic or just substring
        // rawContent header matches delimiter. The content starts after the delimiter/symbol.
        // We know it starts around item.index. Substring including prefix:
        const rawSub = rawContent.substring(item.index, end);
        // Clean up prefix " a) ", "\na. ", etc.
        // Regex: start with optional whitespace, then [a-d], then dot or paren, then space
        const itemContent = rawSub.replace(/^[\s\r\n]*[a-d][\.\)]\s*/i, '').trim();

        parsedSubItems.push({ key: item.key, content: itemContent });
      }
    }

    // Save as ONE Question with type 'true_false'
    const question = this.questionRepository.create({
      content: stem,
      type: 'true_false',
      dataType: 'md',
      examId,
      orderIndex,
    });
    const savedQuestion = await this.questionRepository.save(question);

    // Save sub-items as Answers
    if (parsedSubItems.length > 0) {
      const answers = parsedSubItems.map((item, index) => this.answerRepository.create({
        content: item.content,  // Store "a) ..." content or just content
        questionId: savedQuestion.id,
        dataType: 'md',
        isCorrect: false, // Cannot distinguish without key
        orderIndex: index,
        // explanation: item.key // Could store 'a', 'b' in explanation or check logic
      }));
      await this.answerRepository.save(answers);
    } else {
      // Fallback: no sub items found, just save question (could be parsing error or empty)
    }
  }

  private async saveShortAnswerQuestion(rawContent: string, examId: number, orderIndex: number) {
    const question = this.questionRepository.create({
      content: rawContent,
      type: 'short_answer',
      dataType: 'md',
      examId,
      orderIndex,
    });
    await this.questionRepository.save(question);
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
