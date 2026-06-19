// 이미지 업로드 상한 10MB (Supabase 버킷 file_size_limit과 일치시킬 것)
export const MAX_IMAGE_UPLOAD_SIZE_BYTES = 10 * 1024 * 1024;

export const ALLOWED_IMAGE_TYPES: Record<string, string> = {
  'image/jpeg': 'jpg',
  'image/png': 'png',
  'image/gif': 'gif',
  'image/webp': 'webp',
};

export function extForType(type: string): string | null {
  return ALLOWED_IMAGE_TYPES[type] ?? null;
}

// 통과 시 null, 실패 시 사용자에게 보여줄 한글 메시지 반환.
export function validateImageFile(file: File): string | null {
  if (!extForType(file.type)) {
    return '이미지 파일만 업로드할 수 있어요.';
  }
  if (file.size > MAX_IMAGE_UPLOAD_SIZE_BYTES) {
    return '이미지 용량은 10MB 이하만 업로드할 수 있어요.';
  }
  return null;
}
