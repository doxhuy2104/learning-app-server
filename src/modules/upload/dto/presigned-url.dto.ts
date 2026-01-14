import { IsEnum, IsString } from 'class-validator';

export enum FileType {
    PDF = 'pdf',
    IMAGE = 'image',
}

export class GetPresignedUrlDto {
    @IsString()
    fileName: string;

    @IsEnum(FileType)
    fileType: FileType;
}
