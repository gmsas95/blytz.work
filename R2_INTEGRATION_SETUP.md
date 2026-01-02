# Cloudflare R2 Integration Setup Guide

## Overview

The backend file upload system has been upgraded from mock S3 implementation to real Cloudflare R2 storage using AWS SDK v3.

## Changes Made

### 1. Installed Dependencies

Added AWS SDK v3 packages to `backend/package.json`:

```bash
npm install @aws-sdk/client-s3 @aws-sdk/s3-request-presigner
```

### 2. Updated `backend/src/routes/upload.ts`

**Key changes:**
- Imported AWS SDK v3 S3 client and presigner
- Initialized S3 client with R2 configuration
- Replaced mock `generateS3PresignedUrl` function with real R2 implementation
- Updated delete endpoint to use real R2 operations
- Added proper error handling and validation

**Lines changed:**
- Lines 1-18: Added AWS SDK imports and S3 client initialization
- Lines 314-347: Replaced mock presigned URL generation with R2 implementation
- Lines 139-185: Updated delete endpoint with real R2 deletion

### 3. Updated `.env.example`

Added R2 configuration variables:

```bash
# Cloudflare R2 Configuration (for file uploads)
AWS_ACCESS_KEY_ID=your-r2-access-key-id
AWS_SECRET_ACCESS_KEY=your-r2-secret-access-key
AWS_S3_BUCKET=your-bucket-name
AWS_REGION=auto
AWS_S3_ENDPOINT=https://your-account-id.r2.cloudflarestorage.com
ACCOUNT_ID=your-cloudflare-account-id
```

## Setup Instructions

### Step 1: Create Cloudflare R2 Bucket

1. Go to [Cloudflare Dashboard](https://dash.cloudflare.com/)
2. Navigate to **R2** → **Create Bucket**
3. Choose a bucket name (e.g., `blytzwork-uploads`)
4. Select your preferred location (or leave default)
5. Click **Create bucket**

### Step 2: Generate R2 Access Keys

1. In R2 dashboard, go to **Manage R2 API Tokens**
2. Click **Create API Token**
3. Give it a descriptive name (e.g., `blytzwork-upload-service`)
4. Permissions: Select **Object Read & Write**
5. Click **Create API Token**
6. **IMPORTANT**: Copy and save:
   - Access Key ID
   - Secret Access Key
   - Account ID (from URL: `https://dash.cloudflare.com/<ACCOUNT_ID>/...`)

### Step 3: Configure Environment Variables

Add the following to your `.env` file (and production environment):

```bash
# Cloudflare R2 Configuration
AWS_ACCESS_KEY_ID=<your-access-key-id>
AWS_SECRET_ACCESS_KEY=<your-secret-access-key>
AWS_S3_BUCKET=<your-bucket-name>
AWS_REGION=auto
AWS_S3_ENDPOINT=https://<your-account-id>.r2.cloudflarestorage.com
ACCOUNT_ID=<your-cloudflare-account-id>
AWS_S3_BUCKET_URL=https://<public-bucket-url>
```

**Note**: The `AWS_S3_BUCKET_URL` is the public URL for your bucket. You can set up a custom domain or use R2's default public access.

### Step 4: Set Up CORS (Required for Browser Uploads)

1. Go to your R2 bucket in Cloudflare Dashboard
2. Click **Settings** → **CORS Policy**
3. Add a new CORS policy:

```json
{
  "AllowedOrigins": [
    "https://blytz.work",
    "http://localhost:3001",
    "http://localhost:3000"
  ],
  "AllowedMethods": [
    "GET",
    "PUT",
    "POST",
    "HEAD"
  ],
  "AllowedHeaders": [
    "*"
  ],
  "MaxAgeSeconds": 3600
}
```

4. Click **Save**

### Step 5: Optional - Set Up Custom Domain for R2

For better performance and branding, set up a custom domain:

1. In R2 dashboard, go to your bucket → **Settings** → **Public Access**
2. Click **Connect Domain**
3. Choose a domain (e.g., `files.blytz.work`)
4. Follow the DNS instructions
5. Update `AWS_S3_BUCKET_URL` to your custom domain

## API Usage

### Get Presigned Upload URL

```bash
POST /api/upload/presigned-url
Authorization: Bearer <firebase-token>
Content-Type: application/json

{
  "fileName": "resume.pdf",
  "fileType": "application/pdf",
  "fileSize": 2048576,
  "uploadType": "va_resume"
}
```

**Response:**

```json
{
  "success": true,
  "data": {
    "presignedUrl": "https://<bucket>.r2.cloudflarestorage.com/<file-key>?X-Amz-Algorithm=...",
    "fileKey": "user123/va_resume/1234567890_resume.pdf",
    "fileUrl": "https://files.blytz.work/user123/va_resume/1234567890_resume.pdf",
    "expiresIn": 3600,
    "maxSize": 10485760
  }
}
```

### Upload File Using Presigned URL

Use the `presignedUrl` from the response above to upload directly to R2:

```javascript
const response = await fetch(presignedUrl, {
  method: 'PUT',
  headers: {
    'Content-Type': 'application/pdf'
  },
  body: file
});
```

### Delete File

```bash
DELETE /api/upload/:fileKey
Authorization: Bearer <firebase-token>
```

## File Type & Size Limits

The upload system enforces these limits:

| Upload Type | Allowed File Types | Max Size |
|------------|-------------------|----------|
| `va_resume` | PDF, DOCX | 10MB |
| `va_portfolio` | Images, PDF, DOCX, Videos | 100MB |
| `va_video` | MP4, QuickTime, AVI, WebM | 500MB |
| `company_logo` | JPG, PNG, SVG, WebP | 5MB |
| `profile_picture` | JPG, PNG, WebP, GIF | 5MB |

**Note**: The system currently enforces a 10MB limit in the presigned URL generation function. This can be adjusted per upload type if needed.

## Security Features

1. **Authentication**: All endpoints require Firebase authentication
2. **Access Control**: Users can only delete their own files (verified by fileKey prefix)
3. **Presigned URLs**: Temporary URLs expire after 1 hour
4. **File Validation**: Strict file type and size validation
5. **Environment Variables**: No hardcoded credentials

## Error Handling

The system provides detailed error responses:

```json
{
  "error": "Failed to generate upload URL",
  "code": "UPLOAD_URL_ERROR",
  "details": "Missing required AWS R2 credentials..."
}
```

Common error codes:
- `R2_NOT_CONFIGURED`: Environment variables not set
- `ACCESS_DENIED`: User trying to delete another user's file
- `INVALID_FILE_TYPE`: File type not allowed for upload type
- `FILE_DELETION_ERROR`: Error deleting file from R2

## Testing

### Test Presigned URL Generation

```bash
curl -X POST http://localhost:3000/api/upload/presigned-url \
  -H "Authorization: Bearer <firebase-token>" \
  -H "Content-Type: application/json" \
  -d '{
    "fileName": "test.pdf",
    "fileType": "application/pdf",
    "fileSize": 1048576,
    "uploadType": "va_resume"
  }'
```

### Test File Upload

Use the presigned URL from the response:

```bash
curl -X PUT "<presigned-url>" \
  -H "Content-Type: application/pdf" \
  --upload-file test.pdf
```

### Test File Deletion

```bash
curl -X DELETE http://localhost:3000/api/upload/user123/va_resume/1234567890_test.pdf \
  -H "Authorization: Bearer <firebase-token>"
```

## Troubleshooting

### Issue: "Missing required AWS R2 credentials"

**Solution**: Ensure all R2 environment variables are set in `.env` file:
- `AWS_ACCESS_KEY_ID`
- `AWS_SECRET_ACCESS_KEY`
- `AWS_S3_BUCKET`
- `AWS_REGION`
- `AWS_S3_ENDPOINT`

### Issue: "Access denied" when uploading

**Solution**: Check CORS policy in R2 bucket settings. Ensure your domain is in `AllowedOrigins`.

### Issue: Presigned URL not working

**Solution**:
1. Verify the URL is used within 1 hour (before expiration)
2. Check that the file type matches the presigned URL content type
3. Ensure the file size doesn't exceed the limit
4. Verify R2 bucket permissions allow object write access

### Issue: Files not publicly accessible

**Solution**: Enable public access on your R2 bucket:
1. Go to R2 bucket → Settings → Public Access
2. Click **Enable**
3. Or set up custom domain for better control

## Production Deployment

When deploying to production:

1. Set environment variables in your deployment platform (Dokploy, AWS, etc.)
2. Ensure R2 bucket is in production account (not development)
3. Use production access keys (not development ones)
4. Enable CORS for production domains
5. Set up monitoring for R2 usage and costs
6. Configure lifecycle rules for old files (if needed)

## Cost Considerations

R2 pricing (as of 2024):
- Storage: $0.015/GB/month
- Class A operations (upload): $4.50/million requests
- Class B operations (download): $0.36/million requests
- Free tier: 10GB storage, 1M Class A, 10M Class B operations per month

For a typical hiring platform with file uploads:
- Average file size: 2MB
- 1,000 uploads = ~2GB storage = $0.03/month
- 1,000 uploads = 1M Class A = $4.50/month
- 10,000 downloads = 10K Class B = $0.0036/month

**Estimated monthly cost for small platform**: ~$5-10

## Next Steps

1. ✅ R2 integration complete
2. ⏳ Consider implementing file virus scanning (optional)
3. ⏳ Add image optimization/compression (optional)
4. ⏳ Set up lifecycle rules for old files (optional)
5. ⏳ Add file upload analytics (optional)

## Files Modified

- `backend/src/routes/upload.ts` - R2 integration implementation
- `backend/package.json` - Added AWS SDK dependencies
- `.env.example` - Added R2 environment variables

## References

- [Cloudflare R2 Documentation](https://developers.cloudflare.com/r2/)
- [AWS SDK v3 Documentation](https://docs.aws.amazon.com/AWSJavaScriptSDK/v3/latest/)
- [R2 API Token Documentation](https://developers.cloudflare.com/r2/api/s3/tokens/)
- [R2 CORS Setup](https://developers.cloudflare.com/r2/buckets/public-buckets/#cors)
