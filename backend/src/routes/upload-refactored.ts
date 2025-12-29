// Upload Routes - Refactored with Service Layer
import { FastifyInstance } from "fastify";
import { verifyAuth } from "../plugins/firebaseAuth.js";
import { z } from "zod";
import { FileService } from "../services/fileService.js";

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
  const fileService = new FileService();

  // Get presigned URL for file upload
  app.post("/upload/presigned-url", {
    preHandler: [verifyAuth]
  }, async (request, reply) => {
    const user = request.user as any;
    const data = uploadRequestSchema.parse(request.body);

    try {
      const result = await fileService.generateUploadUrl(user.uid, data);

      return {
        success: true,
        data: result
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
    const { key, bucket, etag } = request.body as { key: string, bucket: string, etag: string };

    try {
      const result = await fileService.confirmUpload(key, bucket, etag);

      return {
        success: true,
        data: result,
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
    const { uploadId } = request.params as { uploadId: string };

    try {
      const status = await fileService.getUploadStatus(uploadId);

      return {
        success: true,
        data: status
      };
    } catch (error: any) {
      return reply.code(500).send({
        error: "Failed to get upload status",
        code: "UPLOAD_STATUS_ERROR",
        details: error.message
      });
    }
  });

  // Delete file
  app.delete("/upload/:key", {
    preHandler: [verifyAuth]
  }, async (request, reply) => {
    const { key } = request.params as { key: string };

    try {
      await fileService.deleteFile(key);

      return {
        success: true,
        message: "File deleted successfully"
      };
    } catch (error: any) {
      return reply.code(500).send({
        error: "Failed to delete file",
        code: "FILE_DELETE_ERROR",
        details: error.message
      });
    }
  });
}
