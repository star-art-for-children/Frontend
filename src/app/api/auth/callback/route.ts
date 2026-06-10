import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';

const EMAIL_CONFLICT_PATTERN =
  /already.*registered|email.*already.*exists|identity.*already/i;

export async function GET(req: NextRequest) {
  const { searchParams, origin } = new URL(req.url);
  const code = searchParams.get('code');

  if (!code) {
    return NextResponse.redirect(`${origin}/login?error=oauth_failed`);
  }

  const supabase = await createClient();
  const { error } = await supabase.auth.exchangeCodeForSession(code);

  if (error) {
    const errorCode = EMAIL_CONFLICT_PATTERN.test(error.message ?? '')
      ? 'email_conflict'
      : 'oauth_failed';
    return NextResponse.redirect(`${origin}/login?error=${errorCode}`);
  }

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return NextResponse.redirect(`${origin}/login?error=oauth_unknown`);
  }

  // 온보딩 완료 여부로 분기 (행 없음/false → 온보딩 강제)
  const { data: profile, error: profileError } = await supabase
    .from('profiles')
    .select('onboarded')
    .eq('id', user.id)
    .single();

  if (profileError && profileError.code !== 'PGRST116') {
    return NextResponse.redirect(`${origin}/`);
  }

  const destination = profile?.onboarded ? '/' : '/onboarding';
  return NextResponse.redirect(`${origin}${destination}`);
}
