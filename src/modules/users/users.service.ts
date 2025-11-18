import {
    Injectable,
    NotFoundException,
    ConflictException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { User } from './entities/user.entity';
import { CreateUserDto } from './dto/create-user.dto';
import { UpdateUserDto } from './dto/update-user.dto';
import { DecodedIdToken } from 'firebase-admin/auth';

@Injectable()
export class UsersService {
    constructor(
        @InjectRepository(User)
        private readonly userRepository: Repository<User>,
    ) { }

    async create(createUserDto: CreateUserDto): Promise<User> {
        const existingEmail = await this.userRepository.findOne({
            where: { email: createUserDto.email },
        });
        if (existingEmail) {
            throw new ConflictException('Email already exists');
        }

        const user = this.userRepository.create({
            email: createUserDto.email,
            fullName: createUserDto.fullName,
            avatar: createUserDto.avatar,
            dob: createUserDto.dob ? new Date(createUserDto.dob) : undefined,
            loginType: createUserDto.loginType,
            isActive: createUserDto.isActive ?? true,
            isVerified: createUserDto.isVerified ?? false,
        });

        const savedUser = await this.userRepository.save(user);
        return savedUser;
    }

    async createOrUpdateFromFirebaseToken(
        firebaseToken: DecodedIdToken,
        additionalData?: Partial<CreateUserDto>,
        token?: string,

    ): Promise<User> {
        const email = firebaseToken.email;
        if (!email) {
            throw new ConflictException('Firebase token must contain email');
        }

        let user = await this.userRepository.findOne({
            where: { email },
        });

        if (user) {
            user.isVerified = firebaseToken.email_verified ?? user.isVerified;
            user.lastLogin = new Date();
            if (firebaseToken.picture && !user.avatar) {
                user.avatar = firebaseToken.picture;
            }
            if (firebaseToken.name && !user.fullName) {
                user.fullName = firebaseToken.name;
            }
            if (additionalData) {
                if (additionalData.fullName) user.fullName = additionalData.fullName;
                if (additionalData.avatar) user.avatar = additionalData.avatar;
                if (additionalData.dob) user.dob = new Date(additionalData.dob);
            }
            const updatedUser = await this.userRepository.save(user);
            return updatedUser;
        }


        const newUser = this.userRepository.create({
            email,
            fullName: firebaseToken.name || additionalData?.fullName,
            avatar: firebaseToken.picture || additionalData?.avatar,
            dob: additionalData?.dob ? new Date(additionalData.dob) : undefined,
            loginType: firebaseToken.firebase?.sign_in_provider || 'firebase',
            isActive: true,
            isVerified: firebaseToken.email_verified ?? false,
            lastLogin: new Date(),
        });

        const savedUser = await this.userRepository.save(newUser);
        return savedUser;
    }


    async findAll(): Promise<User[]> {
        const users = await this.userRepository.find({
            order: { createdAt: 'DESC' },
        });
        return users;
    }

    async findOne(id: number): Promise<User> {
        const user = await this.userRepository.findOne({
            where: { userId: id },
        });

        if (!user) {
            throw new NotFoundException(`User with ID ${id} not found`);
        }

        return user;
    }

    async findByEmail(email: string): Promise<User | null> {
        return this.userRepository.findOne({
            where: { email },
        });
    }

    async update(
        id: number,
        updateUserDto: UpdateUserDto,
    ): Promise<User> {
        const user = await this.userRepository.findOne({
            where: { userId: id },
        });

        if (!user) {
            throw new NotFoundException(`User with ID ${id} not found`);
        }

        // Check if email is being updated and already exists
        if (updateUserDto.email && updateUserDto.email !== user.email) {
            const existingEmail = await this.userRepository.findOne({
                where: { email: updateUserDto.email },
            });
            if (existingEmail) {
                throw new ConflictException('Email already exists');
            }
        }

        // Update user fields
        if (updateUserDto.email !== undefined) user.email = updateUserDto.email;
        if (updateUserDto.fullName !== undefined) user.fullName = updateUserDto.fullName;
        if (updateUserDto.avatar !== undefined) user.avatar = updateUserDto.avatar;
        if (updateUserDto.dob !== undefined)
            user.dob = updateUserDto.dob ? new Date(updateUserDto.dob) : undefined;
        if (updateUserDto.loginType !== undefined) user.loginType = updateUserDto.loginType;
        if (updateUserDto.isActive !== undefined) user.isActive = updateUserDto.isActive;
        if (updateUserDto.isVerified !== undefined)
            user.isVerified = updateUserDto.isVerified;

        const updatedUser = await this.userRepository.save(user);
        return updatedUser;
    }

    async remove(id: number): Promise<void> {
        const user = await this.userRepository.findOne({
            where: { userId: id },
        });

        if (!user) {
            throw new NotFoundException(`User with ID ${id} not found`);
        }

        await this.userRepository.remove(user);
    }

    async updateLastLogin(id: number): Promise<void> {
        await this.userRepository.update(
            { userId: id },
            { lastLogin: new Date() },
        );
    }

    async updateToken(id: number, token: string): Promise<void> {
        await this.userRepository.update(
            { userId: id },
            { accessToken: token },
        );
    }
}
