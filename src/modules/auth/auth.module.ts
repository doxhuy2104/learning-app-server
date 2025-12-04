import { Module, forwardRef } from '@nestjs/common';
import { JwtModule } from '@nestjs/jwt';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { AuthService } from './auth.service';
import { AuthController } from './auth.controller';
import { UserModule } from '../user/user.module';
import { FirebaseModule } from '../../firebase/firebase.module';
import { JwtAuthGuard } from './jwt-auth.guard';
import type { JwtModuleOptions } from '@nestjs/jwt';

@Module({
    imports: [
        forwardRef(() => UserModule), // Dùng forwardRef để tránh circular dependency
        FirebaseModule,
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
    controllers: [AuthController],
    providers: [AuthService, JwtAuthGuard],
    exports: [AuthService, JwtAuthGuard],
})
export class AuthModule { }
