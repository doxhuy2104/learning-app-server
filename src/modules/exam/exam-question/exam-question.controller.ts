import {
  Body,
  Controller,
  Delete,
  Get,
  HttpCode,
  HttpStatus,
  Param,
  ParseIntPipe,
  Patch,
  Post,
} from '@nestjs/common';
import { CreateExamDto } from './dto/create-exam-question.dto';
import { ExamQuestionService } from './exam-question.service';

@Controller('exam-question')
export class ExamQuestionController {
  constructor(private readonly examService: ExamQuestionService) {}

  @Post()
  @HttpCode(HttpStatus.CREATED)
  create(@Body() createExamDto: CreateExamDto) {
    return this.examService.create(createExamDto);
  }

  @Get()
  findAll() {
    return this.examService.findAll();
  }

  @Get(':id')
  findOne(@Param('id', ParseIntPipe) id: number) {
    return this.examService.findOne(id);
  }

  @Get('lesson/:lessonId')
  findByLessonId(@Param('lessonId', ParseIntPipe) lessonId: number) {
    return this.examService.findByLessonId(lessonId);
  }

  @Get('course/:courseId')
  findByCourseId(@Param('courseId', ParseIntPipe) courseId: number) {
    return this.examService.findByCourseId(courseId);
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
