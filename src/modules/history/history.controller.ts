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
    Req,
    UnauthorizedException,
    Logger,
    UseGuards,
} from '@nestjs/common';
import { HistoryService } from './history.service';
import { CreateExamHistoryDto } from './dto/create-exam-history.dto';
import { UpdateExamHistoryDto } from './dto/update-exam-history.dto';
import { CreateUserAnswerDto } from './dto/create-user-answer.dto';
import { SubmitExamDto } from './dto/submit-exam.dto';
import type { Request } from 'express';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';

@Controller('history')
export class HistoryController {
    constructor(private readonly historyService: HistoryService) { }

    @Post()
    @HttpCode(HttpStatus.CREATED)
    create(@Body() createExamHistoryDto: CreateExamHistoryDto) {
        return this.historyService.create(createExamHistoryDto);
    }

    @Get(':id')
    findOne(@Param('id', ParseIntPipe) id: number) {
        return this.historyService.findOne(id);
    }


    @Get('user/:userId')
    findByUserId(@Param('userId', ParseIntPipe) userId: number) {
        return this.historyService.findByUserId(userId);
    }

    @Get('exam/:examId')
    findByExamId(@Param('examId', ParseIntPipe) examId: number) {
        return this.historyService.findByExamId(examId);
    }

    @Get('user/:userId/exam/:examId')
    findByUserAndExam(
        @Param('userId', ParseIntPipe) userId: number,
        @Param('examId', ParseIntPipe) examId: number,
    ) {
        return this.historyService.findByUserAndExam(userId, examId);
    }

    @Patch(':id')
    update(
        @Param('id', ParseIntPipe) id: number,
        @Body() updateExamHistoryDto: UpdateExamHistoryDto,
    ) {
        return this.historyService.update(id, updateExamHistoryDto);
    }

    @Delete(':id')
    @HttpCode(HttpStatus.NO_CONTENT)
    remove(@Param('id', ParseIntPipe) id: number) {
        return this.historyService.remove(id);
    }

    @Post('user-answer')
    @HttpCode(HttpStatus.CREATED)
    createUserAnswer(@Body() createUserAnswerDto: CreateUserAnswerDto) {
        return this.historyService.createUserAnswer(createUserAnswerDto);
    }

    @Post('submit')
    @HttpCode(HttpStatus.OK)
    @UseGuards(JwtAuthGuard)
    submitExam(@Req() req: Request, @Body() submitExamDto: SubmitExamDto) {
        const userId = (req as any)?.user?.id;
        if (!userId) {
            throw new UnauthorizedException('User not found in request context');
        }
        return this.historyService.submitExam(submitExamDto, userId);
    }

    @Get(':id/answers')
    getUserAnswers(@Param('id', ParseIntPipe) id: number) {
        return this.historyService.getUserAnswersByHistoryId(id);
    }
}

