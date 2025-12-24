// Profile Completion Helper Functions

export function calculateProfileCompletion(profile: any): number {
  if (!profile) return 0;
  
  const checks = [
    profile.name?.length > 0,           // 10%
    profile.bio?.length > 10,           // 15%
    profile.country?.length > 0,         // 10%
    profile.hourlyRate > 0,            // 15%
    profile.skills?.length > 0,          // 15%
    profile.email?.length > 0,           // 10%
    profile.phone?.length > 0,           // 5%
    profile.timezone?.length > 0,        // 5%
    profile.avatarUrl?.length > 0,        // 5%
    profile.resumeUrl?.length > 0,        // 5%
    profile.videoIntroUrl?.length > 0     // 5%
  ];
  
  const completed = checks.filter(Boolean).length;
  return Math.round((completed / checks.length) * 100);
}

export function calculateCompanyCompletion(profile: any): number {
  if (!profile) return 0;
  
  const checks = [
    profile.name?.length > 0,           // 15%
    profile.bio?.length > 10,           // 10%
    profile.country?.length > 0,         // 10%
    profile.industry?.length > 0,        // 10%
    profile.companySize?.length > 0,      // 10%
    profile.website?.length > 0,          // 10%
    profile.email?.length > 0,           // 5%
    profile.phone?.length > 0,           // 5%
    profile.logoUrl?.length > 0,          // 10%
    profile.description?.length > 20,      // 10%
    profile.mission?.length > 5           // 5%
  ];
  
  const completed = checks.filter(Boolean).length;
  return Math.round((completed / checks.length) * 100);
}

export function generateThumbnailUrl(fileUrl: string, fileType: string): string | null {
  if (!fileUrl || !fileType) return null;
  
  // For images, generate thumbnail URL
  if (fileType.startsWith('image/')) {
    return `${fileUrl}?thumbnail=300x300&quality=80`;
  }
  
  // For videos, generate thumbnail URL
  if (fileType.startsWith('video/')) {
    return `${fileUrl}?thumbnail=300x300&frame=1`;
  }
  
  // For PDFs and documents, no thumbnail
  return null;
}

export function sanitizeFileName(fileName: string): string {
  return fileName.replace(/[^a-zA-Z0-9.-]/g, '_');
}

export function getFileExtension(fileName: string): string {
  return fileName.split('.').pop()?.toLowerCase() || '';
}

export function generateFileKey(userId: string, fileName: string, uploadType: string, fileType: string): string {
  const timestamp = Date.now();
  const extension = getFileExtension(fileName);
  const sanitizedName = sanitizeFileName(fileName.replace(`.${extension}`, ''));
  
  return `${userId}/${uploadType}/${timestamp}_${sanitizedName}.${extension}`;
}