import { Controller, Get, Query, UseGuards } from '@nestjs/common';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { Roles } from '../auth/roles.decorator';
import { RolesGuard } from '../auth/roles.guard';
import { ManagementService } from './management.service';

@Controller('management')
@UseGuards(JwtAuthGuard, RolesGuard)
@Roles('ADMIN')
export class ManagementController {
    constructor(private readonly managementService: ManagementService) { }

    @Get()
    async getOverview() {
        return this.managementService.getOverview();
    }

    /**
     * GET /management/users
     * Lấy danh sách người dùng cho trang quản lý
     */
    @Get('users')
    async getUsers() {
        return this.managementService.getUsers();
    }

    /**
     * GET /management/exams
     * Lấy danh sách đề thi cho trang quản lý
     */
    @Get('exams')
    async getExams() {
        return this.managementService.getExams();
    }

    /**
     * GET /management/histories
     * Lấy danh sách lịch sử làm bài (có phân trang)
     */
    @Get('histories')
    async getHistories(
        @Query('page') page?: string,
        @Query('limit') limit?: string,
    ) {
        const pageNumber = page ? parseInt(page, 10) : 1;
        const limitNumber = limit ? parseInt(limit, 10) : 10;
        return this.managementService.getHistories(pageNumber, limitNumber);
    }

    /**
     * GET /management/courses
     * Lấy danh sách khóa học cho trang quản lý
     */
    @Get('courses')
    async getCourses() {
        return this.managementService.getCourses();
    }
}


