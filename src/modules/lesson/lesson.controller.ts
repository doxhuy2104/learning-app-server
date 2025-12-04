import {
    Controller,
    Get,
    Post,
    Body,
    Patch,
    Param,
    Delete,
    ParseIntPipe,
    HttpCode,
    HttpStatus,
} from '@nestjs/common';
import { LessonService } from './lesson.service';
import { CreateLessonDto } from './dto/create-lesson.dto';

@Controller('lesson')
export class LessonController {
    constructor(private readonly lessonService: LessonService) { }

    @Post()
    @HttpCode(HttpStatus.CREATED)
    create(@Body() createLessonDto: CreateLessonDto) {
        return this.lessonService.create(createLessonDto);
    }

    @Get()
    findAll() {
        return this.lessonService.findAll();
    }

    @Get(':id')
    findOne(@Param('id', ParseIntPipe) id: number) {
        return this.lessonService.findOne(id);
    }

    @Get('course/:courseId')
    findByCourseId(@Param('courseId', ParseIntPipe) courseId: number) {
        return this.lessonService.findByCourseId(courseId);
    }

    @Get('url/:url')
    findByUrl(@Param('url') url: string) {
        return this.lessonService.findByurl(url);
    }

    @Patch(':id')
    update(
        @Param('id', ParseIntPipe) id: number,
        @Body() updateData: Partial<CreateLessonDto>,
    ) {
        return this.lessonService.update(id, updateData);
    }

    @Delete(':id')
    @HttpCode(HttpStatus.NO_CONTENT)
    remove(@Param('id', ParseIntPipe) id: number) {
        return this.lessonService.remove(id);
    }
}

