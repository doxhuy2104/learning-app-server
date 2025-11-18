import { Module, forwardRef } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { JwtModule } from '@nestjs/jwt';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { UsersService } from './users.service';
import { UsersController } from './users.controller';
import { User } from './entities/user.entity';
import { AuthModule } from '../auth/auth.module';
import type { JwtModuleOptions } from '@nestjs/jwt';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';

@Module({
    imports: [
        TypeOrmModule.forFeature([User]),
        JwtModule.registerAsync({
            imports: [ConfigModule],
            useFactory: (configService: ConfigService): JwtModuleOptions => {
                const expiresInValue = configService.get<string>('JWT_EXPIRES_IN') || '7d';
                return {
                    secret: configService.get<string>('JWT_SECRET') || 'your-secret-key',
                    signOptions: {
                        expiresIn: expiresInValue,
                    },
                } as JwtModuleOptions;
            },
            inject: [ConfigService],
        }),
    ],
    controllers: [UsersController],
    providers: [UsersService, JwtAuthGuard],
    exports: [UsersService],
})
export class UsersModule { }
