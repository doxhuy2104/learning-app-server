import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  Query,
  ParseIntPipe,
  HttpCode,
  HttpStatus,
} from '@nestjs/common';
import { CourseService } from './course.service';
import { CreateCourseDto } from './dto/create-course.dto';

@Controller('course')
export class CourseController {
  constructor(private readonly courseService: CourseService) {}

  @Post()
  @HttpCode(HttpStatus.CREATED)
  create(@Body() createCourseDto: CreateCourseDto) {
    return this.courseService.create(createCourseDto);
  }

  @Get()
  findAll(@Query('isExam') isExam: string) {
    const isExamBoolean = isExam === 'true';
    return this.courseService.findAll(isExamBoolean);
  }

  @Get(':id')
  findOne(@Param('id', ParseIntPipe) id: number) {
    return this.courseService.findOne(id);
  }

  @Get('url/:url')
  findByUrl(@Param('url') url: string) {
    return this.courseService.findByurl(url);
  }

  @Get('subject/:subjectId')
  findBySubjectId(
    @Param('subjectId') subjectId: number,
    @Query('isExam') isExam: string,
  ) {
    return this.courseService.findBySubjectId(subjectId, isExam === 'true');
  }

  @Patch(':id')
  update(
    @Param('id', ParseIntPipe) id: number,
    @Body() updateData: Partial<CreateCourseDto>,
  ) {
    return this.courseService.update(id, updateData);
  }

  @Delete(':id')
  @HttpCode(HttpStatus.NO_CONTENT)
  remove(@Param('id', ParseIntPipe) id: number) {
    return this.courseService.remove(id);
  }
}
