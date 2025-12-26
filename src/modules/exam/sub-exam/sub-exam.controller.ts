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
import { SubExamService } from './sub-exam.service';
import { CreateSubExamDto } from './dto/create-sub-exam.dto';

@Controller('subexam')
export class SubExamController {
    constructor(private readonly examService: SubExamService) { }

    @Post()
    @HttpCode(HttpStatus.CREATED)
    create(@Body() createExamDto: CreateSubExamDto) {
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

    @Get('exam/:examId')
    findByExamId(@Param('examId', ParseIntPipe) examId: number) {
        return this.examService.findByExamId(examId);
    }

    @Get('url/:url')
    findByUrl(@Param('url') url: string) {
        return this.examService.findByurl(url);
    }

    @Patch(':id')
    update(
        @Param('id', ParseIntPipe) id: number,
        @Body() updateData: Partial<CreateSubExamDto>,
    ) {
        return this.examService.update(id, updateData);
    }

    @Delete(':id')
    @HttpCode(HttpStatus.NO_CONTENT)
    remove(@Param('id', ParseIntPipe) id: number) {
        return this.examService.remove(id);
    }
}

