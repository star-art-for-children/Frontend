export function isPublicStorageUrl(
  url: string,
  bucket: 'thumbnails' | 'artworks'
): boolean {
  return url.startsWith(
    `${process.env.NEXT_PUBLIC_SUPABASE_URL}/storage/v1/object/public/${bucket}/`
  );
}
