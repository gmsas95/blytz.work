// Simplified Upload Routes for Week 2 MVP
import { FastifyInstance } from "fastify";
import { verifyAuth } from "../plugins/firebaseAuth-simplified.js";
import { z } from "zod";

// Validation schemas
const uploadRequestSchema = z.object({
  fileName: z.string().min(1, "File name is required"),
  fileType: z.string().min(1, "File type is required"),
  fileSize: z.number().max(100 * 1024 * 1024, "File size must be less than 100MB"),
  uploadType: z.enum(['va_portfolio', 'va_resume', 'va_video', 'company_logo', 'profile_picture']),
  category: z.string().optional(),
  description: z.string().optional()
});

export default async function uploadRoutes(app: FastifyInstance) {
  // Get presigned URL for file upload
  app.post("/upload/presigned-url", {
    preHandler: [verifyAuth]
  }, async (request, reply) => {
    const user = request.user as any;
    const data = uploadRequestSchema.parse(request.body);

    try {
      // Validate file type based on upload type
      const allowedTypes = getAllowedFileTypes(data.uploadType);
      if (!allowedTypes.includes(data.fileType)) {
        return reply.code(400).send({ 
          error: `File type not allowed for ${data.uploadType}. Allowed types: ${allowedTypes.join(', ')}`,
          code: "INVALID_FILE_TYPE"
        });
      }

      // Generate unique file key
      const fileKey = generateFileKey(user.uid, data.fileName, data.uploadType, data.fileType);

      // Generate presigned URL for S3 upload
      const presignedUrl = await generateS3PresignedUrl(fileKey, data.fileType, data.fileSize);
      
      return {
        success: true,
        data: {
          presignedUrl,
          fileKey,
          fileUrl: `${process.env.AWS_S3_BUCKET_URL || 'https://mock-bucket.s3.amazonaws.com'}/${fileKey}`,
          expiresIn: 3600, // 1 hour
          maxSize: getMaxFileSize(data.uploadType)
        }
      };
    } catch (error: any) {
      if (error instanceof z.ZodError) {
        return reply.code(400).send({ 
          error: "Validation error",
          code: "VALIDATION_ERROR",
          details: error.errors
        });
      }

      return reply.code(500).send({ 
        error: "Failed to generate upload URL",
        code: "UPLOAD_URL_ERROR",
        details: error.message
      });
    }
  });

  // Confirm upload completion
  app.post("/upload/confirm", {
    preHandler: [verifyAuth]
  }, async (request, reply) => {
    const user = request.user as any;
    const { key, bucket, etag } = request.body as { key: string, bucket: string, etag: string };

    try {
      // Mock confirmation response
      return {
        success: true,
        data: {
          key,
          bucket,
          etag,
          uploadedAt: new Date(),
          processed: true
        },
        message: "Upload confirmed and processed successfully"
      };
    } catch (error: any) {
      return reply.code(500).send({ 
        error: "Failed to confirm upload",
        code: "UPLOAD_CONFIRM_ERROR",
        details: error.message
      });
    }
  });

  // Get upload status
  app.get("/upload/status/:uploadId", {
    preHandler: [verifyAuth]
  }, async (request, reply) => {
    const user = request.user as any;
    const { uploadId } = request.params as { uploadId: string };

    try {
      // Mock upload status
      return {
        success: true,
        data: {
          id: uploadId,
          userId: user.uid,
          status: 'completed',
          createdAt: new Date(),
          fileSize: 2048576,
          fileType: 'image/jpeg'
        }
      };
    } catch (error: any) {
      return reply.code(500).send({ 
        error: "Failed to fetch upload status",
        code: "UPLOAD_STATUS_ERROR",
        details: error.message
      });
    }
  });

  // Delete uploaded file
  app.delete("/upload/:fileKey", {
    preHandler: [verifyAuth]
  }, async (request, reply) => {
    const user = request.user as any;
    const { fileKey } = request.params as { fileKey: string };

    try {
      // Mock deletion
      console.log(`🗑️ Deleting file from S3: ${fileKey}`);

      return {
        success: true,
        message: "File deleted successfully"
      };
    } catch (error: any) {
      return reply.code(500).send({ 
        error: "Failed to delete file",
        code: "FILE_DELETION_ERROR",
        details: error.message
      });
    }
  });

  // Get user uploads
  app.get("/uploads", {
    preHandler: [verifyAuth]
  }, async (request, reply) => {
    const user = request.user as any;
    const { uploadType, page = 1, limit = 20 } = request.query as { 
      uploadType?: string, 
      page: string, 
      limit: string 
    };

    try {
      // Mock uploads
      return {
        success: true,
        data: {
          uploads: [
            {
              id: 'upload_1',
              userId: user.uid,
              fileKey: `${user.uid}/va_portfolio/sample_project.pdf`,
              uploadType: 'va_portfolio',
              fileName: 'sample_project.pdf',
              fileSize: 2048576,
              fileType: 'application/pdf',
              status: 'completed',
              createdAt: new Date('2024-01-01')
            }
          ],
          pagination: {
            page: parseInt(String(page)),
            limit: parseInt(String(limit)),
            total: 1,
            totalPages: 1
          }
        }
      };
    } catch (error: any) {
      return reply.code(500).send({ 
        error: "Failed to fetch uploads",
        code: "UPLOADS_FETCH_ERROR",
        details: error.message
      });
    }
  });

  // Process uploaded file
  app.post("/upload/process", {
    preHandler: [verifyAuth]
  }, async (request, reply) => {
    const user = request.user as any;
    const { fileKey, processingType } = request.body as { 
      fileKey: string, 
      processingType: 'thumbnail' | 'optimize' | 'extract' 
    };

    try {
      // Mock processing
      const fileUrl = `${process.env.AWS_S3_BUCKET_URL || 'https://mock-bucket.s3.amazonaws.com'}/${fileKey}`;
      
      return {
        success: true,
        data: {
          fileUrl,
          processingType,
          processed: true,
          thumbnailUrl: processingType === 'thumbnail' ? `${fileUrl}?thumbnail=300x300` : null,
          optimizedUrl: processingType === 'optimize' ? `${fileUrl}?optimized` : null
        },
        message: "File processed successfully"
      };
    } catch (error: any) {
      return reply.code(500).send({ 
        error: "Failed to process file",
        code: "FILE_PROCESSING_ERROR",
        details: error.message
      });
    }
  });
}

// Helper functions
function getAllowedFileTypes(uploadType: string): string[] {
  const typeMap: Record<string, string[]> = {
    'va_portfolio': [
      'image/jpeg', 'image/png', 'image/gif', 'image/webp',
      'application/pdf', 'application/msword', 'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
      'video/mp4', 'video/quicktime', 'video/x-msvideo',
      'text/html', 'text/css', 'application/javascript'
    ],
    'va_resume': [
      'application/pdf', 'application/msword', 'application/vnd.openxmlformats-officedocument.wordprocessingml.document'
    ],
    'va_video': [
      'video/mp4', 'video/quicktime', 'video/x-msvideo', 'video/webm'
    ],
    'company_logo': [
      'image/jpeg', 'image/png', 'image/svg+xml', 'image/webp'
    ],
    'profile_picture': [
      'image/jpeg', 'image/png', 'image/webp', 'image/gif'
    ]
  };

  return typeMap[uploadType] || [];
}

function getMaxFileSize(uploadType: string): number {
  const sizeMap: Record<string, number> = {
    'va_portfolio': 100 * 1024 * 1024, // 100MB
    'va_resume': 10 * 1024 * 1024, // 10MB
    'va_video': 500 * 1024 * 1024, // 500MB
    'company_logo': 5 * 1024 * 1024, // 5MB
    'profile_picture': 5 * 1024 * 1024 // 5MB
  };

  return sizeMap[uploadType] || 10 * 1024 * 1024; // 10MB default
}

function generateFileKey(userId: string, fileName: string, uploadType: string, fileType: string): string {
  const timestamp = Date.now();
  const extension = fileName.split('.').pop();
  const sanitizedName = fileName.replace(/[^a-zA-Z0-9.-]/g, '_');
  
  return `${userId}/${uploadType}/${timestamp}_${sanitizedName}`;
}

async function generateS3PresignedUrl(fileKey: string, fileType: string, fileSize: number): Promise<string> {
  // Mock presigned URL - in production, use AWS SDK
  return `https://s3.amazonaws.com/mock-bucket/${fileKey}?presigned=${Date.now()}&type=${encodeURIComponent(fileType)}`;
}