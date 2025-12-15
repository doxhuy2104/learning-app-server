import { IsInt, IsNotEmpty, IsOptional, IsString, IsBoolean } from 'class-validator';

export class CreateUserAnswerDto {
    @IsInt()
    @IsNotEmpty()
    historyId: number;

    @IsInt()
    @IsNotEmpty()
    examId: number;

    @IsInt()
    @IsNotEmpty()
    questionId: number;

    @IsOptional()
    @IsInt()
    answerId?: number;

    @IsOptional()
    @IsString()
    userAnswer?: string;

    @IsOptional()
    @IsBoolean()
    isCorrect?: boolean;

    @IsOptional()
    @IsInt()
    pointsEarned?: number;
}

