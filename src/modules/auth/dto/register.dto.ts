import {
  IsOptional,
  IsString,
  IsNotEmpty,
  MaxLength,
  IsDateString,
} from 'class-validator';

export class RegisterDto {
  @IsNotEmpty()
  @IsString()
  idToken: string;

  @IsOptional()
  @IsString()
  @MaxLength(255)
  fullName?: string;
}
