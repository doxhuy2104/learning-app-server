import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  Patch,
  Post,
  Query,
  UseGuards,
  UseInterceptors
} from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { Roles } from '../auth/roles.decorator';
import { RolesGuard } from '../auth/roles.guard';
import { AdminService } from './admin.service';
import { OcrResultDto } from './dto/ocr-result.dto';

@Controller('admin')
export class AdminController {
  constructor(private readonly adminService: AdminService) { }

  @Get()
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('ADMIN')
  async getOverview() {
    return this.adminService.getOverview();
  }

  @Get('users')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('ADMIN')
  async getUsers(@Query('page') page?: string, @Query('limit') limit?: string) {
    const pageNumber = page ? parseInt(page, 10) : 1;
    const limitNumber = limit ? parseInt(limit, 10) : 10;
    return this.adminService.getUsers(pageNumber, limitNumber);
  }

  @Get('exams')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('ADMIN')
  async getExams(@Query('page') page?: string, @Query('limit') limit?: string) {
    const pageNumber = page ? parseInt(page, 10) : 1;
    const limitNumber = limit ? parseInt(limit, 10) : 10;
    return this.adminService.getExams(pageNumber, limitNumber);
  }

  @Delete('exams/:id')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('ADMIN')
  async deleteExam(@Param('id') id: string) {
    return this.adminService.deleteExam(+id);
  }

  @Patch('exams/:id')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('ADMIN')
  async updateExam(@Param('id') id: string, @Body() data: any) {
    return this.adminService.updateExam(+id, data);
  }

  @Get('histories')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('ADMIN')
  async getHistories(
    @Query('page') page?: string,
    @Query('limit') limit?: string,
  ) {
    const pageNumber = page ? parseInt(page, 10) : 1;
    const limitNumber = limit ? parseInt(limit, 10) : 10;
    return this.adminService.getHistories(pageNumber, limitNumber);
  }

  @Get('courses')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('ADMIN')
  async getCourses(
    @Query('page') page?: string,
    @Query('limit') limit?: string,
  ) {
    const pageNumber = page ? parseInt(page, 10) : 1;
    const limitNumber = limit ? parseInt(limit, 10) : 10;
    return this.adminService.getCourses(pageNumber, limitNumber);
  }

  @Get('subjects')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('ADMIN')
  async getSubjects(
    @Query('page') page?: string,
    @Query('limit') limit?: string,
  ) {
    const pageNumber = page ? parseInt(page, 10) : 1;
    const limitNumber = limit ? parseInt(limit, 10) : 10;
    return this.adminService.getSubjects(pageNumber, limitNumber);
  }

  @Get('exams/subject/:subjectId')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('ADMIN')
  async getExamsBySubjectId(
    @Param('subjectId') subjectId: string,
    @Query('page') page?: string,
    @Query('limit') limit?: string,
  ) {
    const subjectIdNumber = parseInt(subjectId, 10);
    const pageNumber = page ? parseInt(page, 10) : 1;
    const limitNumber = limit ? parseInt(limit, 10) : 10;
    return this.adminService.getExamsBySubjectId(
      subjectIdNumber,
      pageNumber,
      limitNumber,
    );
  }

  @Get('questions/exam/:examId')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('ADMIN')
  async getQuestionsByExamId(@Param('examId') examId: string) {
    const examIdNumber = parseInt(examId, 10);
    return this.adminService.getQuestionsByExamId(examIdNumber);
  }

  @Get('images/exam/:examId')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('ADMIN')
  async getImagesByExamId(@Param('examId') examId: string) {
    const examIdNumber = parseInt(examId, 10);
    return this.adminService.getImagesByExamId(examIdNumber);
  }

  @Post('ocr')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('ADMIN')
  @UseInterceptors(FileInterceptor('file'))
  async uploadOcr(
    // @UploadedFile() file: any,
    @Body('fileName') fileName?: string,
    @Body('subjectId') subjectId?: number,
  ) {
    if (!fileName) {
      throw new Error('File name is required');
    }
    return this.adminService.uploadToOcr(fileName, subjectId);
  }

  @Post('ocr/result')
  async ocrResult(@Body() resultDto: OcrResultDto) {
    return this.adminService.handleOcrResult(resultDto);
  }
}
