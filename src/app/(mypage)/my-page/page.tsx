import { redirect } from 'next/navigation';
import { createClient } from '@/lib/supabase/server';
import { getStatus } from '@/lib/exhibition/dateStatus';
import { fetchUserAchievements } from '@/lib/achievements/server';
import { ACHIEVEMENTS } from '@/lib/achievements/definitions';
import { getBalance } from '@/lib/payments/credit';
import type { Profile } from '@/types/profile';
import MyPageScreen from '@/components/my-page/MyPageScreen';

export default async function MyPage() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  // 로그인하지 않은 경우 로그인 페이지로 이동
  if (!user) redirect('/login');

  // profiles 테이블에서 현재 유저의 프로필 조회
  const { data: profileData, error: profileError } = await supabase
    .from('profiles')
    .select('username, role, institution, onboarded, selected_title')
    .eq('id', user.id)
    .single();

  // PGRST116: row 없음 (정상 edge case) / 그 외 에러는 예외 처리
  if (profileError && profileError.code !== 'PGRST116') redirect('/');

  // 온보딩 미완료(또는 profile 행 없음)는 비로그인 취급 → 온보딩으로
  if (!profileData?.onboarded) redirect('/onboarding');

  const role = profileData?.role === 'teacher' ? 'teacher' : 'general';
  const name =
    profileData?.username ??
    user.user_metadata?.username ??
    user.email?.split('@')[0] ??
    '사용자';
  const email = user.email ?? '';
  const selectedTitle = profileData?.selected_title ?? null;

  // 마이페이지 상단에 보여줄 현재 크레딧 잔액
  const balance = await getBalance(user.id);

  // 스탬프 데이터 기반 업적 달성 현황 계산
  // 표시용이므로 조회 실패 시 빈 현황으로 폴백 (페이지 전체는 막지 않음)
  let achievementResult;
  try {
    achievementResult = await fetchUserAchievements(supabase, user.id);
  } catch (e) {
    console.error('업적 조회 실패', e);
    achievementResult = {
      achievements: ACHIEVEMENTS.map((a) => ({ id: a.id, achieved: false })),
      totalStamps: 0,
      clearedCount: 0,
    };
  }

  let profile: Profile;

  if (role === 'teacher') {
    // 선생님이면 본인이 만든 전시회 목록과 각 전시회의 작품 수를 함께 조회
    const { data: exhibitionsData, error: exhibitionsError } = await supabase
      .from('exhibitions')
      .select('id, title, thumbnail_url, start_date, end_date, artworks(count)')
      .eq('teacher_id', user.id)
      .order('created_at', { ascending: false });

    if (exhibitionsError) redirect('/');

    profile = {
      id: user.id,
      name,
      email,
      academy_name: profileData?.institution ?? '',
      role: 'teacher',
      selectedTitle,
      exhibitions: (exhibitionsData ?? []).map((ex) => {
        // dateStatus.ts의 getStatus()를 재사용해서 상태 계산
        // ongoing/upcoming → active, ended → ended 로 매핑
        const rawStatus = getStatus(ex.start_date, ex.end_date ?? undefined);
        const artworks = ex.artworks as { count: number }[] | null;
        return {
          id: ex.id,
          title: ex.title,
          artworkCount: artworks?.[0]?.count ?? 0,
          status: rawStatus === 'ongoing' ? ('active' as const) : rawStatus,
          thumbnail: ex.thumbnail_url,
          start_date: ex.start_date,
        };
      }),
    };
  } else {
    profile = {
      id: user.id,
      name,
      email,
      role: 'general',
      selectedTitle,
    };
  }

  return (
    <MyPageScreen
      profile={profile}
      achievement={achievementResult}
      balance={balance}
    />
  );
}
