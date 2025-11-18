import {
    IsEmail,
    IsOptional,
    IsString,
    IsDateString,
    IsBoolean,
    MaxLength,
} from 'class-validator';

export class UpdateUserDto {
    @IsOptional()
    @IsEmail()
    email?: string;

    @IsOptional()
    @IsString()
    @MaxLength(100)
    username?: string;

    @IsOptional()
    @IsString()
    @MaxLength(255)
    fullName?: string;

    @IsOptional()
    @IsString()
    @MaxLength(500)
    avatar?: string;

    @IsOptional()
    @IsDateString()
    dob?: string;

    @IsOptional()
    @IsString()
    @MaxLength(32)
    loginType?: string;

    @IsOptional()
    @IsBoolean()
    isActive?: boolean;

    @IsOptional()
    @IsBoolean()
    isVerified?: boolean;
}

