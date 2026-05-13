import { type NextRequest } from 'next/server';
import { updateSession } from '@/lib/supabase/middleware';

export async function middleware(request: NextRequest) {
  return await updateSession(request);
}

export const config = {
  matcher: [
    {
      source:
        // API 라우트 요청, 정적 파일, 이미지, 아이콘 제외한 모든 요청에서 updateSession 미들웨어 함수 실행
        '/((?!api|_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp|woff|woff2|ttf|otf)$).*)',
      missing: [
        // prefetch 요청은 함수 실행 제외
        { type: 'header', key: 'next-router-prefetch' },
        { type: 'header', key: 'purpose', value: 'prefetch' },
      ],
    },
  ],
};
