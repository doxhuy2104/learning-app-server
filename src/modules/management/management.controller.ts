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
     * Lấy danh sách người dùng cho trang quản lý (chỉ role USER, có phân trang)
     */
    @Get('users')
    async getUsers(
        @Query('page') page?: string,
        @Query('limit') limit?: string,
    ) {
        const pageNumber = page ? parseInt(page, 10) : 1;
        const limitNumber = limit ? parseInt(limit, 10) : 10;
        return this.managementService.getUsers(pageNumber, limitNumber);
    }

    /**
     * GET /management/exams
     * Lấy danh sách đề thi cho trang quản lý (có phân trang)
     */
    @Get('exams')
    async getExams(
        @Query('page') page?: string,
        @Query('limit') limit?: string,
    ) {
        const pageNumber = page ? parseInt(page, 10) : 1;
        const limitNumber = limit ? parseInt(limit, 10) : 10;
        return this.managementService.getExams(pageNumber, limitNumber);
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
     * Lấy danh sách khóa học cho trang quản lý (có phân trang)
     */
    @Get('courses')
    async getCourses(
        @Query('page') page?: string,
        @Query('limit') limit?: string,
    ) {
        const pageNumber = page ? parseInt(page, 10) : 1;
        const limitNumber = limit ? parseInt(limit, 10) : 10;
        return this.managementService.getCourses(pageNumber, limitNumber);
    }
}


