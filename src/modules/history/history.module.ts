import { Module } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { JwtModule, JwtModuleOptions } from '@nestjs/jwt';
import { TypeOrmModule } from '@nestjs/typeorm';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { Answer } from '../exam/answer/entities/answer.entity';
import { Question } from '../exam/question/entities/question.entity';
import { ExamHistory } from './entities/exam-history.entity';
import { UserAnswer } from './entities/user-answer.entity';
import { HistoryController } from './history.controller';
import { HistoryService } from './history.service';

@Module({
    imports: [
        TypeOrmModule.forFeature([ExamHistory, UserAnswer, Answer, Question]),
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
    controllers: [HistoryController],
    providers: [HistoryService, JwtAuthGuard],
    exports: [HistoryService],
})
export class HistoryModule { }

