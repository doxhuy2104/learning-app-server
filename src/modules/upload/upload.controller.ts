import { Body, Controller, Post, UseGuards } from '@nestjs/common';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { Roles } from '../auth/roles.decorator';
import { RolesGuard } from '../auth/roles.guard';
import { GetPresignedUrlDto } from './dto/presigned-url.dto';
import { UploadService } from './upload.service';

@Controller('upload')
export class UploadController {
    constructor(private readonly uploadService: UploadService) { }

    @Post('presigned-url')
    @UseGuards(JwtAuthGuard, RolesGuard)
    @Roles('ADMIN')
    async getPresignedUrl(@Body() body: GetPresignedUrlDto) {
        return this.uploadService.getPresignedUrl(body.fileName, body.fileType);
    }
}
