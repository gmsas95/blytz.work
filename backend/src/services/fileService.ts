// File Service - Business Logic Layer for File Operations
import { generatePresignedUrl, deleteObject, generatePresignedGetUrl } from '../utils/s3.js';

export class FileService {
  async generateUploadUrl(userId: string, data: {
    fileName: string;
    fileType: string;
    fileSize: number;
    uploadType: string;
    category?: string;
    description?: string;
  }) {
    // Validate file type based on upload type
    const allowedTypes = this.getAllowedFileTypes(data.uploadType);
    if (!allowedTypes.includes(data.fileType)) {
      throw new Error(`File type not allowed for ${data.uploadType}. Allowed types: ${allowedTypes.join(', ')}`);
    }

    // Generate unique file key
    const fileKey = this.generateFileKey(userId, data.fileName, data.uploadType, data.fileType);

    // Generate presigned URL for S3 upload
    const result = await generatePresignedUrl({
      key: fileKey,
      contentType: data.fileType,
      maxSize: data.fileSize
    });

    return {
      presignedUrl: result.url,
      fileKey: result.key,
      fileUrl: `${process.env.AWS_S3_BUCKET_URL || 'https://mock-bucket.s3.amazonaws.com'}/${fileKey}`,
      expiresIn: 3600, // 1 hour
      maxSize: this.getMaxFileSize(data.uploadType)
    };
  }

  async confirmUpload(key: string, bucket: string, etag: string) {
    // In production, verify file exists in S3
    return {
      key,
      bucket,
      etag,
      uploadedAt: new Date(),
      processed: true
    };
  }

  async getUploadStatus(uploadId: string) {
    // Mock upload status - in production, check S3 or database
    return {
      uploadId,
      status: 'completed',
      progress: 100,
      fileUrl: `https://mock-bucket.s3.amazonaws.com/uploads/${uploadId}`,
      createdAt: new Date()
    };
  }

  async deleteFile(key: string) {
    await deleteObject({ key });
    return {
      success: true,
      message: 'File deleted successfully'
    };
  }

  private generateFileKey(userId: string, fileName: string, uploadType: string, fileType: string): string {
    const timestamp = Date.now();
    const extension = fileName.split('.').pop();
    return `${uploadType}/${userId}/${timestamp}-${fileName}`;
  }

  private getAllowedFileTypes(uploadType: string): string[] {
    const typeMap: Record<string, string[]> = {
      'va_portfolio': ['image/jpeg', 'image/png', 'image/gif', 'application/pdf', 'video/mp4'],
      'va_resume': ['application/pdf', 'application/msword', 'application/vnd.openxmlformats-officedocument.wordprocessingml.document'],
      'va_video': ['video/mp4', 'video/webm', 'video/quicktime'],
      'company_logo': ['image/jpeg', 'image/png', 'image/gif', 'image/svg+xml'],
      'profile_picture': ['image/jpeg', 'image/png', 'image/gif']
    };

    return typeMap[uploadType] || [];
  }

  private getMaxFileSize(uploadType: string): number {
    const sizeMap: Record<string, number> = {
      'va_portfolio': 50 * 1024 * 1024, // 50MB
      'va_resume': 10 * 1024 * 1024, // 10MB
      'va_video': 500 * 1024 * 1024, // 500MB
      'company_logo': 5 * 1024 * 1024, // 5MB
      'profile_picture': 5 * 1024 * 1024 // 5MB
    };

    return sizeMap[uploadType] || 10 * 1024 * 1024; // 10MB default
  }
}
