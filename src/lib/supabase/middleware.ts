import { createServerClient } from '@supabase/ssr';
import { NextResponse, type NextRequest } from 'next/server';

export async function updateSession(request: NextRequest) {
  let supabaseResponse = NextResponse.next({ request });

  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll() {
          return request.cookies.getAll(); // 미들웨어에서는 NextRequest 객체에서 cookie 접근. 아직 React 렌더링 컨텍스트 생성되기 전이라 next/headers의 cookies() 사용 불가.
        },
        setAll(cookiesToSet) {
          cookiesToSet.forEach(({ name, value }) =>
            request.cookies.set(name, value)
          );
          supabaseResponse = NextResponse.next({ request });
          cookiesToSet.forEach(({ name, value, options }) =>
            supabaseResponse.cookies.set(name, value, options)
          );
        },
      },
    }
  );

  const { error } = await supabase.auth.getClaims(); // JWT claims 검증 및 필요 시 토큰 갱신/쿠키 최신화

  if (error?.code === 'refresh_token_not_found') {
    supabaseResponse.cookies.getAll().forEach(({ name }) => {
      if (name.startsWith('sb-')) supabaseResponse.cookies.delete(name);
    });
  }

  return supabaseResponse;
}
