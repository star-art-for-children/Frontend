import { redirect } from 'next/navigation';
import { createClient } from '@/lib/supabase/server';
import { getStatus } from '@/lib/exhibition/dateStatus';
import MyPageScreen from '@/components/myPage/MyPageScreen';
import type { Profile } from '@/types/myPage';

export default async function MyPage() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  // 로그인하지 않은 경우 로그인 페이지로 이동
  if (!user) redirect('/login');

  // profiles 테이블에서 현재 유저의 프로필 조회
  const { data: profileData } = await supabase
    .from('profiles')
    .select('username, role, institution')
    .eq('id', user.id)
    .single();

  const role = profileData?.role === 'teacher' ? 'teacher' : 'user';
  const name =
    profileData?.username ??
    user.user_metadata?.username ??
    user.email?.split('@')[0] ??
    '사용자';
  const email = user.email ?? '';

  let profile: Profile;

  if (role === 'teacher') {
    // 선생님이면 본인이 만든 전시회 목록과 각 전시회의 작품 수를 함께 조회
    const { data: exhibitionsData } = await supabase
      .from('exhibitions')
      .select('id, title, thumbnail_url, start_date, end_date, artworks(count)')
      .eq('teacher_id', user.id)
      .order('created_at', { ascending: false });

    profile = {
      id: user.id,
      name,
      email,
      academy_name: profileData?.institution ?? '',
      role: 'teacher',
      exhibitions: (exhibitionsData ?? []).map((ex) => {
        // dateStatus.ts의 getStatus()를 재사용해서 상태 계산
        // ongoing/upcoming → active, ended → ended 로 매핑
        const rawStatus = getStatus(ex.start_date, ex.end_date ?? undefined);
        const artworks = ex.artworks as { count: number }[] | null;
        return {
          id: ex.id,
          title: ex.title,
          artworkCount: artworks?.[0]?.count ?? 0,
          status: rawStatus === 'ended' ? ('ended' as const) : ('active' as const),
          thumbnail: ex.thumbnail_url,
        };
      }),
    };
  } else {
    profile = {
      id: user.id,
      name,
      email,
      role: 'user',
    };
  }

  return <MyPageScreen profile={profile} />;
}
