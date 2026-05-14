// 이미지 업로드 상한 5MB
import { SupabaseClient } from '@supabase/supabase-js';

const MAX_IMAGE_UPLOAD_SIZE_BYTES = 5 * 1024 * 1024;
// 허용 이미지 타입 제한
const ALLOWED_IMAGE_TYPES: Record<string, string> = {
  'image/jpeg': 'jpg',
  'image/png': 'png',
  'image/gif': 'gif',
  'image/webp': 'webp',
};

// 이미지 검증 에러 클래스
export class ImageUploadValidationError extends Error {
  constructor(message: string) {
    super(message);
    this.name = 'ImageUploadValidationError';
  }
}

export async function uploadImgToSupabase(
  supabase: SupabaseClient,
  file: File,
  bucket: string
) {
  const ext = ALLOWED_IMAGE_TYPES[file.type];

  if (!ext) {
    throw new ImageUploadValidationError('Only image files can be uploaded');
  }

  if (file.size > MAX_IMAGE_UPLOAD_SIZE_BYTES) {
    throw new ImageUploadValidationError('Image file size must be 5MB or less');
  }

  const randomId = crypto.randomUUID();
  const filePath = `${randomId}.${ext}`;

  const { error } = await supabase.storage.from(bucket).upload(filePath, file);

  if (error) {
    throw new Error('Image upload failed');
  }

  const { data } = supabase.storage.from(bucket).getPublicUrl(filePath);

  return data.publicUrl;
}
