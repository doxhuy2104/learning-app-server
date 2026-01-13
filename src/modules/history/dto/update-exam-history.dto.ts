import {
  IsOptional,
  IsDateString,
  IsInt,
  IsEnum,
  IsNumber,
} from 'class-validator';

export class UpdateExamHistoryDto {
  @IsOptional()
  @IsDateString()
  endTime?: string;

  @IsOptional()
  @IsDateString()
  submitTime?: string;

  @IsOptional()
  @IsInt()
  timeSpend?: number;

  @IsOptional()
  @IsEnum(['in_progress', 'completed', 'timeout', 'abandoned'])
  status?: 'in_progress' | 'completed' | 'timeout' | 'abandoned';

  @IsOptional()
  @IsNumber()
  score?: number;
}
