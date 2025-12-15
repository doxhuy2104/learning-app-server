import { IsInt, IsNotEmpty, IsOptional, IsDateString } from 'class-validator';

export class CreateExamHistoryDto {
    @IsInt()
    @IsNotEmpty()
    userId: number;

    @IsInt()
    @IsNotEmpty()
    examId: number;

}

