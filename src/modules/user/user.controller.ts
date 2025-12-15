import {
    Body,
    Controller,
    Delete,
    Get,
    Param,
    Put,
    Post,
    ParseIntPipe,
    HttpCode,
    HttpStatus,
    UseGuards,
    Req,
} from '@nestjs/common';
import { UserService } from './user.service';
import { CreateUserDto } from './dto/create-user.dto';
import { UpdateUserDto } from './dto/update-user.dto';
import { FirebaseAuthGuard } from '../auth/firebase-auth.guard';
import { CurrentUser } from '../auth/decorators/current-user.decorator';
import type { DecodedIdToken } from 'firebase-admin/auth';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';

@Controller('user')
export class UserController {
    constructor(private readonly userService: UserService) { }

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
        return this.userService.createOrUpdateFromFirebaseToken(
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
        const decoded = req.user;

        if (!decoded || !decoded.id) {
            throw new Error('User ID not found in token');
        }

        const user = await this.userService.findOne(decoded.id);
        return user;
    }

    /**
     * Create user manually (admin only or for testing)
     */
    @UseGuards(JwtAuthGuard)
    @Post()
    @HttpCode(HttpStatus.CREATED)
    async create(@Body() createUserDto: CreateUserDto) {
        return this.userService.create(createUserDto);
    }

    @UseGuards(JwtAuthGuard)
    @Get()
    async findAll() {
        return this.userService.findAll();
    }

    @UseGuards(JwtAuthGuard)
    @Get(':id')
    async findOne(@Param('id', ParseIntPipe) id: number) {
        return this.userService.findOne(id);
    }

    @UseGuards(JwtAuthGuard)
    @Put(':id')
    async update(
        @Param('id', ParseIntPipe) id: number,
        @Body() updateUserDto: UpdateUserDto,
        @CurrentUser() firebaseUser: DecodedIdToken,
    ) {
        // Optional: Add check to ensure user can only update their own profile
        // For now, allowing any authenticated user to update any profile
        return this.userService.update(id, updateUserDto);
    }

    /**
     * Delete user
     */
    @UseGuards(JwtAuthGuard)
    @Delete(':id')
    @HttpCode(HttpStatus.NO_CONTENT)
    async remove(@Param('id', ParseIntPipe) id: number) {
        await this.userService.remove(id);
    }
}
