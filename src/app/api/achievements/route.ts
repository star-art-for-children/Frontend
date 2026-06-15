import { NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';
import { fetchUserAchievements } from '@/lib/achievements/server';

// 현재 유저의 업적 현황 + 대표 칭호 조회 (갤러리 스탬프북 등 클라이언트용)
export async function GET() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return NextResponse.json({ message: 'no session' }, { status: 401 });
  }

  const result = await fetchUserAchievements(supabase, user.id);

  const { data: profile } = await supabase
    .from('profiles')
    .select('selected_title')
    .eq('id', user.id)
    .maybeSingle();

  return NextResponse.json({
    ...result,
    selectedTitle: profile?.selected_title ?? null,
  });
}
