'use client';
import { createClient } from '@/lib/supabase/client';
import { validateImageFile } from '@/lib/supabase/imageConstraints';

export type UploadBucket = 'artworks' | 'thumbnails';

// 클라이언트가 Supabase로 직접 업로드(Vercel 4.5MB 우회) 후 public URL 반환.
// 검증 실패 시 한글 메시지를 가진 Error를 throw.
export async function uploadViaSignedUrl(
  file: File,
  bucket: UploadBucket
): Promise<string> {
  const invalid = validateImageFile(file);
  if (invalid) throw new Error(invalid);

  const res = await fetch('/api/uploads/sign', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ bucket, contentType: file.type }),
  });
  if (!res.ok) {
    const { message } = await res.json().catch(() => ({}));
    throw new Error(message ?? '업로드 준비에 실패했어요.');
  }
  const { path, token, publicUrl } = await res.json();

  const supabase = createClient();
  const { error } = await supabase.storage
    .from(bucket)
    .uploadToSignedUrl(path, token, file);
  if (error) throw new Error('이미지 업로드에 실패했어요.');

  return publicUrl;
}
