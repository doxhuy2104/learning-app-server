import { PutObjectCommand, S3Client } from '@aws-sdk/client-s3';
import { getSignedUrl } from '@aws-sdk/s3-request-presigner';
import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { v4 as uuidv4 } from 'uuid';

@Injectable()
export class UploadService {
    private s3Client: S3Client;
    private bucketName: string;

    constructor(private configService: ConfigService) {
        const region = this.configService.get<string>('AWS_REGION') || '';
        const accessKeyId =
            this.configService.get<string>('AWS_ACCESS_KEY_ID') || '';
        const secretAccessKey =
            this.configService.get<string>('AWS_SECRET_ACCESS_KEY') || '';
        this.bucketName = this.configService.get<string>('AWS_BUCKET_NAME') || '';

        this.s3Client = new S3Client({
            region,
            credentials: {
                accessKeyId,
                secretAccessKey,
            },
        });
    }

    async getPresignedUrl(
        fileName: string,
    ): Promise<{ url: string; key: string }> {
        const key = `uploads/${uuidv4()}-${fileName}`;
        const command = new PutObjectCommand({
            Bucket: this.bucketName,
            Key: key,
            ContentType: 'application/pdf',
        });

        const url = await getSignedUrl(this.s3Client, command, { expiresIn: 3600 });

        return { url, key };
    }
}
