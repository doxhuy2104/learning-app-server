import {
    Body,
    Controller,
    Delete,
    Get,
    Param,
    Patch,
    Post,
    ParseIntPipe,
    HttpCode,
    HttpStatus,
    UseGuards,
    Req,
} from '@nestjs/common';
import { UsersService } from './users.service';
import { CreateUserDto } from './dto/create-user.dto';
import { UpdateUserDto } from './dto/update-user.dto';
import { FirebaseAuthGuard } from '../auth/firebase-auth.guard';
import { CurrentUser } from '../auth/decorators/current-user.decorator';
import type { DecodedIdToken } from 'firebase-admin/auth';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';

@Controller('users')
export class UsersController {
    constructor(private readonly usersService: UsersService) { }

    /**
     * Sync/Create user from Firebase token
     * This endpoint creates or updates user based on Firebase authentication token
     */
    @UseGuards(JwtAuthGuard)
    @Post('sync')
    @HttpCode(HttpStatus.OK)
    async syncFromFirebaseToken(
        @CurrentUser() firebaseUser: DecodedIdToken,
        @Body() additionalData?: Partial<CreateUserDto>,
    ) {
        return this.usersService.createOrUpdateFromFirebaseToken(
            firebaseUser,
            additionalData,
        );
    }

    /**
     * Get current authenticated user profile
     */
    @UseGuards(JwtAuthGuard)
    @Get('me')
    async getCurrentUser(@CurrentUser() token: string, @Req() req: any) {
        // Lấy decoded payload từ request (đã được verify bởi JwtAuthGuard)
        const decoded = req.user;

        if (!decoded || !decoded.user_id) {
            throw new Error('User ID not found in token');
        }

        // Lấy user từ database bằng user_id
        const user = await this.usersService.findOne(decoded.user_id);
        return user;
    }

    /**
     * Create user manually (admin only or for testing)
     */
    @UseGuards(JwtAuthGuard)
    @Post()
    @HttpCode(HttpStatus.CREATED)
    async create(@Body() createUserDto: CreateUserDto) {
        return this.usersService.create(createUserDto);
    }

    /**
     * Get all users (admin only)
     */
    @UseGuards(JwtAuthGuard)
    @Get()
    async findAll() {
        return this.usersService.findAll();
    }

    /**
     * Get user by ID
     */
    @UseGuards(JwtAuthGuard)
    @Get(':id')
    async findOne(@Param('id', ParseIntPipe) id: number) {
        return this.usersService.findOne(id);
    }

    /**
     * Update user
     * Users can only update their own profile, or admin can update any
     */
    @UseGuards(JwtAuthGuard)
    @Patch(':id')
    async update(
        @Param('id', ParseIntPipe) id: number,
        @Body() updateUserDto: UpdateUserDto,
        @CurrentUser() firebaseUser: DecodedIdToken,
    ) {
        // Optional: Add check to ensure user can only update their own profile
        // For now, allowing any authenticated user to update any profile
        return this.usersService.update(id, updateUserDto);
    }

    /**
     * Delete user
     */
    @UseGuards(JwtAuthGuard)
    @Delete(':id')
    @HttpCode(HttpStatus.NO_CONTENT)
    async remove(@Param('id', ParseIntPipe) id: number) {
        await this.usersService.remove(id);
    }
}
