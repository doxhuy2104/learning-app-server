import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { HistoryService } from './history.service';
import { HistoryController } from './history.controller';
import { ExamHistory } from './entities/exam-history.entity';
import { UserAnswer } from './entities/user-answer.entity';
import { Answer } from '../answer/entities/answer.entity';
import { Question } from '../question/entities/question.entity';
import { JwtModule, JwtModuleOptions } from '@nestjs/jwt';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';

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
    providers: [HistoryService,JwtAuthGuard],
    exports: [HistoryService],
})
export class HistoryModule { }

