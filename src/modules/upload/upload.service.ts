import { GetObjectCommand, GetObjectCommandOutput, PutObjectCommand, S3Client } from '@aws-sdk/client-s3';
import { getSignedUrl } from '@aws-sdk/s3-request-presigner';
import { Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';

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
        fileType: string,
    ): Promise<{ url: string; key: string }> {
        const key = `${fileType}/${fileName}`;
        const command = new PutObjectCommand({
            Bucket: this.bucketName,
            Key: key,
            ContentType: fileType === 'pdf' ? 'application/pdf' : 'image/png',
        });
        Logger.log('command', command);
        const url = await getSignedUrl(this.s3Client, command, { expiresIn: 3600 });

        return { url, key };
    }

    async getFileContent(key: string): Promise<string> {
        const command = new GetObjectCommand({
            Bucket: this.bucketName,
            Key: key,
        });

        try {
            const response = await this.s3Client.send(command) as GetObjectCommandOutput;
            return await response.Body?.transformToString() || '';
        } catch (error: any) {
            Logger.error(`Failed to get file content from S3: ${error.message}`);
            throw error;
        }
    }

    async getFolderContent(prefix: string): Promise<string[]> {
        const { ListObjectsV2Command } = await import('@aws-sdk/client-s3');
        const command = new ListObjectsV2Command({
            Bucket: this.bucketName,
            Prefix: prefix,
        });

        const keys: string[] = [];
        let isTruncated = true;
        let continuationToken: string | undefined = undefined;

        try {
            while (isTruncated) {
                const response = await this.s3Client.send(command);
                if (response.Contents) {
                    response.Contents.forEach((item) => {
                        if (item.Key) {
                            keys.push(item.Key);
                        }
                    });
                }
                isTruncated = response.IsTruncated ?? false;
                continuationToken = response.NextContinuationToken;
                command.input.ContinuationToken = continuationToken;
            }
            return keys;
        } catch (error: any) {
            Logger.error(`Failed to list folder content from S3: ${error.message}`);
            throw error;
        }
    }

    async deleteFile(key: string): Promise<void> {
        const { DeleteObjectCommand } = await import('@aws-sdk/client-s3');
        const command = new DeleteObjectCommand({
            Bucket: this.bucketName,
            Key: key,
        });

        try {
            await this.s3Client.send(command);
        } catch (error: any) {
            Logger.error(`Failed to delete file from S3: ${error.message}`);
            throw error;
        }
    }

    async deleteFolder(prefix: string): Promise<void> {
        const keys = await this.getFolderContent(prefix);
        if (keys.length > 0) {
            const { DeleteObjectsCommand } = await import('@aws-sdk/client-s3');
            const command = new DeleteObjectsCommand({
                Bucket: this.bucketName,
                Delete: {
                    Objects: keys.map(k => ({ Key: k })),
                },
            });
            try {
                await this.s3Client.send(command);
            } catch (error: any) {
                Logger.error(`Failed to delete folder from S3: ${error.message}`);
                throw error;
            }
        }
    }
}

