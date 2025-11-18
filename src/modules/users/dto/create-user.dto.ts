import {
    IsEmail,
    IsNotEmpty,
    IsOptional,
    IsString,
    IsDateString,
    IsBoolean,
    MaxLength,
} from 'class-validator';

export class CreateUserDto {
    @IsEmail()
    @IsNotEmpty()
    email: string;

    @IsNotEmpty()
    @IsString()
    @MaxLength(100)
    username: string;

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

    @IsNotEmpty()
    @IsString()
    @MaxLength(255)
    token: string;
}