import {
  IsInt,
  IsNotEmpty,
  IsArray,
  ValidateNested,
  IsOptional,
  IsString,
  IsBoolean,
  IsNumber,
  IsDateString,
} from 'class-validator';
import { Type } from 'class-transformer';

export class SubmitAnswerDto {
  @IsInt()
  @IsNotEmpty()
  questionOrderIndex: number;

  @IsInt()
  answerOrderIndex?: number;

  shortAnswer?: string;

  trueFalseAnswer?: string;

  @IsOptional()
  @IsBoolean()
  isCorrect?: boolean;

  @IsOptional()
  @IsNumber()
  score?: number;
}

export class SubmitExamDto {
  @IsOptional()
  @IsInt()
  historyId?: number;

  @IsInt()
  @IsNotEmpty()
  examId: number;

  @IsInt()
  subjectId: number;

  @IsOptional()
  @IsDateString()
  submitTime?: string;

  @IsOptional()
  @IsInt()
  timeSpent?: number;

  @IsOptional()
  @IsNumber()
  score?: number;

  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => SubmitAnswerDto)
  answers: SubmitAnswerDto[];
}
