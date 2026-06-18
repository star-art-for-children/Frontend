import { getImageProps } from 'next/image';

// 갤러리 3D 텍스처용 최적화 URL.
// next/image 최적화 엔드포인트(/_next/image)는 동일 출처라 WebGL CORS 문제가 없고,
// webp 변환 + Vercel CDN 캐시로 전송 용량과 Supabase egress를 줄인다.
// width 1080 / quality 75는 Next 기본 deviceSizes·기본 quality 허용목록 안에 있어야 한다.
export function optimizedTextureUrl(src: string): string {
  if (!src) return src;
  const { props } = getImageProps({
    src,
    alt: '',
    width: 1080,
    height: 1080,
    quality: 75,
  });
  return props.src;
}
