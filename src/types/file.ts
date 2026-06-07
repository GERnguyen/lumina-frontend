export interface PresignedUrlResponse {
  presignedUrl: string;
  fileName: string;
  fileKey: string;
}

export interface UploadProgress {
  loaded: number;
  total: number;
  percent: number;
}

export type FileContentType = 'document' | 'image' | 'video';

export const CONTENT_TYPE_MAP: Record<FileContentType, string[]> = {
  document: ['application/pdf'],
  image: ['image/jpeg', 'image/png'],
  video: ['video/mp4'],
};

export const FILE_SIZE_LIMITS: Record<FileContentType, number> = {
  document: 5 * 1024 * 1024, // 5MB
  image: 10 * 1024 * 1024,   // 10MB
  video: 100 * 1024 * 1024,  // 100MB
};