import { S3Client, PutObjectCommand, DeleteObjectCommand, GetObjectCommand } from '@aws-sdk/client-s3';
import { getSignedUrl } from '@aws-sdk/s3-request-presigner';

// Cloudflare R2 is S3-compatible
// Configuration for Cloudflare R2
const r2Client = !process.env.CLOUDFLARE_R2_ACCESS_KEY_ID || !process.env.CLOUDFLARE_R2_SECRET_ACCESS_KEY || !process.env.CLOUDFLARE_R2_BUCKET_NAME
  ? null
  : new S3Client({
      region: 'auto', // R2 uses 'auto' region
      endpoint: `https://${process.env.CLOUDFLARE_R2_ACCOUNT_ID}.r2.cloudflarestorage.com`,
      credentials: {
        accessKeyId: process.env.CLOUDFLARE_R2_ACCESS_KEY_ID,
        secretAccessKey: process.env.CLOUDFLARE_R2_SECRET_ACCESS_KEY,
      },
    });

const bucketName = process.env.CLOUDFLARE_R2_BUCKET_NAME || '';
const publicUrl = process.env.CLOUDFLARE_R2_PUBLIC_URL || '';

interface GeneratePresignedUrlOptions {
  key: string;
  contentType: string;
  maxSize?: number;
  expiresIn?: number;
}

interface DeleteObjectOptions {
  key: string;
}

interface UploadObjectOptions {
  key: string;
  body: Buffer | Uint8Array | Blob | string;
  contentType: string;
}

/**
 * Generate a presigned URL for direct S3 upload
 */
export async function generatePresignedUrl(options: GeneratePresignedUrlOptions): Promise<{ url: string; key: string }> {
  if (!r2Client) {
    throw new Error('Cloudflare R2 is not configured');
  }

  const { key, contentType, maxSize, expiresIn = 3600 } = options;

  const command = new PutObjectCommand({
    Bucket: bucketName,
    Key: key,
    ContentType: contentType,
    ContentLength: maxSize,
  });

  try {
    const url = await getSignedUrl(r2Client, command, { expiresIn });
    return { url, key };
  } catch (error: any) {
    throw new Error(`Failed to generate presigned URL: ${error.message}`);
  }
}

/**
 * Upload file directly to S3
 */
export async function uploadObject(options: UploadObjectOptions): Promise<{ key: string; location: string }> {
  if (!r2Client) {
    throw new Error('Cloudflare R2 is not configured');
  }

  const { key, body, contentType } = options;

  const command = new PutObjectCommand({
    Bucket: bucketName,
    Key: key,
    Body: body,
    ContentType: contentType,
  });

  try {
    await r2Client.send(command);
    
    // Return public URL if configured, otherwise return R2 URL
    const location = publicUrl 
      ? `${publicUrl}/${key}`
      : `https://${process.env.CLOUDFLARE_R2_ACCOUNT_ID}.r2.cloudflarestorage.com/${bucketName}/${key}`;
    
    return {
      key,
      location,
    };
  } catch (error: any) {
    throw new Error(`Failed to upload object: ${error.message}`);
  }
}

/**
 * Delete object from S3
 */
export async function deleteObject(options: DeleteObjectOptions): Promise<void> {
  if (!r2Client) {
    throw new Error('Cloudflare R2 is not configured');
  }

  const { key } = options;

  const command = new DeleteObjectCommand({
    Bucket: bucketName,
    Key: key,
  });

  try {
    await r2Client.send(command);
  } catch (error: any) {
    throw new Error(`Failed to delete object: ${error.message}`);
  }
}

/**
 * Get object from S3
 */
export async function getObject(key: string): Promise<Buffer> {
  if (!r2Client) {
    throw new Error('Cloudflare R2 is not configured');
  }

  const command = new GetObjectCommand({
    Bucket: bucketName,
    Key: key,
  });

  try {
    const response = await r2Client.send(command);
    const chunks: Uint8Array[] = [];
    
    if (response.Body) {
      // Handle different Body types
      const body = response.Body;
      
      if (typeof body === 'string') {
        return Buffer.from(body, 'utf-8');
      }
      
      if (body instanceof Uint8Array) {
        return Buffer.from(body);
      }
      
      // Handle stream
      const bodyStream = body as any;
      for await (const chunk of bodyStream) {
        chunks.push(chunk);
      }
      return Buffer.concat(chunks);
    }
    
    throw new Error('No body in response');
  } catch (error: any) {
    throw new Error(`Failed to get object: ${error.message}`);
  }
}

/**
 * Generate presigned URL for object download
 */
export async function generatePresignedGetUrl(key: string, expiresIn = 3600): Promise<string> {
  if (!r2Client) {
    throw new Error('Cloudflare R2 is not configured');
  }

  const command = new GetObjectCommand({
    Bucket: bucketName,
    Key: key,
  });

  try {
    return await getSignedUrl(r2Client, command, { expiresIn });
  } catch (error: any) {
    throw new Error(`Failed to generate presigned get URL: ${error.message}`);
  }
}

export { r2Client, bucketName };
