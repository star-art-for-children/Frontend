import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';
import { getAuthContext } from '@/lib/auth/getAuthContext';
import { ACHIEVEMENTS } from '@/lib/achievements/definitions';
import { fetchUserAchievements } from '@/lib/achievements/server';

// 대표 칭호 선택/해제
// 칭호는 실제 획득한 업적의 것만 설정할 수 있다. (미획득 칭호 임의 설정 차단)
export async function PATCH(req: NextRequest) {
  const supabase = await createClient();
  const { user, profile } = await getAuthContext();

  if (!user || !profile?.onboarded) {
    return NextResponse.json({ message: 'unauthorized' }, { status: 401 });
  }

  let body: unknown;
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ message: 'invalid json body' }, { status: 400 });
  }

  const selectedTitle = (body as { selectedTitle?: unknown })?.selectedTitle;

  if (selectedTitle !== null && typeof selectedTitle !== 'string') {
    return NextResponse.json({ message: 'invalid title' }, { status: 400 });
  }

  // 칭호를 설정하는 경우(null이 아니면) 획득 여부를 검증
  if (selectedTitle !== null) {
    const def = ACHIEVEMENTS.find((a) => a.title === selectedTitle);
    if (!def) {
      return NextResponse.json({ message: 'unknown title' }, { status: 400 });
    }
    const { achievements } = await fetchUserAchievements(supabase, user.id);
    const achieved = achievements.find((a) => a.id === def.id)?.achieved;
    if (!achieved) {
      return NextResponse.json(
        { message: '아직 획득하지 않은 칭호입니다.' },
        { status: 403 }
      );
    }
  }

  const { error } = await supabase
    .from('profiles')
    .update({ selected_title: selectedTitle })
    .eq('id', user.id);

  if (error) {
    return NextResponse.json({ message: 'database error' }, { status: 500 });
  }

  return NextResponse.json({ selectedTitle }, { status: 200 });
}
