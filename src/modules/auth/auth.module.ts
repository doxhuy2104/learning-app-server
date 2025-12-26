import { Module, forwardRef } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
import type { JwtModuleOptions } from '@nestjs/jwt';
import { JwtModule } from '@nestjs/jwt';
import { FirebaseModule } from '../../firebase/firebase.module';
import { UserModule } from '../user/user.module';
import { AuthController } from './auth.controller';
import { AuthService } from './auth.service';
import { JwtAuthGuard } from './jwt-auth.guard';
import { RolesGuard } from './roles.guard';

@Module({
    imports: [
        forwardRef(() => UserModule),
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
    providers: [AuthService, JwtAuthGuard, RolesGuard],
    exports: [AuthService, JwtAuthGuard, RolesGuard, JwtModule],
})
export class AuthModule { }
