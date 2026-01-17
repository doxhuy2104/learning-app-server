import {
  Body,
  Controller,
  Delete,
  Get,
  HttpCode,
  HttpStatus,
  Logger,
  Param,
  ParseIntPipe,
  Patch,
  Post,
  Req,
  UseGuards,
} from '@nestjs/common';
import { Request } from 'express';
import { OptionalJwtAuthGuard } from 'src/modules/auth/optional-jwt-auth.guard';
import { CreateExamDto } from './dto/create-exam-question.dto';
import { ExamQuestionService } from './exam-question.service';

@Controller('exam-question')
@UseGuards(OptionalJwtAuthGuard)
export class ExamQuestionController {
  constructor(
    private readonly examService: ExamQuestionService,
  ) { }

  @Post()
  @HttpCode(HttpStatus.CREATED)
  create(@Body() createExamDto: CreateExamDto) {
    return this.examService.create(createExamDto);
  }

  @Get()
  findAll(@Req() req: Request) {
    const userId = (req as any).user?.id;
    return this.examService.findAll(userId);
  }

  @Get(':id')
  findOne(@Param('id', ParseIntPipe) id: number, @Req() req: Request) {
    const userId = (req as any).user?.id;
    return this.examService.findOne(id, userId);
  }

  @Get('lesson/:lessonId')
  findByLessonId(@Param('lessonId', ParseIntPipe) lessonId: number, @Req() req: Request) {
    const userId = (req as any).user?.id;
    return this.examService.findByLessonId(lessonId, userId);
  }

  @Get('course/:courseId')
  findByCourseId(@Param('courseId', ParseIntPipe) courseId: number, @Req() req: Request) {
    const userId = (req as any).user?.id;
    return this.examService.findByCourseId(courseId, userId);
  }

  @Get('subject/:subjectId')
  findBySubjectId(@Param('subjectId', ParseIntPipe) subjectId: number, @Req() req: Request) {
    const userId = (req as any).user?.id;
    return this.examService.findBySubjectId(subjectId, userId);
  }

  @Get('url/:url')
  findByUrl(@Param('url') url: string) {
    return this.examService.findByurl(url);
  }

  @Patch(':id')
  update(
    @Param('id', ParseIntPipe) id: number,
    @Body() updateData: Partial<CreateExamDto>,
  ) {
    return this.examService.update(id, updateData);
  }

  @Delete(':id')
  @HttpCode(HttpStatus.NO_CONTENT)
  remove(@Param('id', ParseIntPipe) id: number) {
    return this.examService.remove(id);
  }
}
