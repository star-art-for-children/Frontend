import 'server-only';

import { createClient } from '@/lib/supabase/server';
import { ACHIEVEMENTS, isAchieved } from './definitions';

type SupabaseServerClient = Awaited<ReturnType<typeof createClient>>;

export type UserAchievement = {
  id: string;
  achieved: boolean;
};

export type UserAchievementResult = {
  achievements: UserAchievement[];
  totalStamps: number;
  clearedCount: number;
};

// 유저의 스탬프 데이터로 완주 전시회 수·총 스탬프 수를 집계하고
// 각 업적 달성 여부를 도출한다. (별도 업적 테이블 없이 실시간 계산)
export async function fetchUserAchievements(
  supabase: SupabaseServerClient,
  userId: string
): Promise<UserAchievementResult> {
  const empty: UserAchievementResult = {
    achievements: ACHIEVEMENTS.map((a) => ({ id: a.id, achieved: false })),
    totalStamps: 0,
    clearedCount: 0,
  };

  // 내 스탬프 → 전시회별 수집 수 집계
  const { data: stamps, error: stampError } = await supabase
    .from('artwork_stamps')
    .select('exhibition_id')
    .eq('user_id', userId);

  // 조회 실패를 0 진행도로 숨기면 칭호 검증에서 오판정되므로 예외로 전파한다.
  // (표시용 호출처는 자체적으로 try/catch 폴백)
  if (stampError) {
    throw new Error('업적 집계: 스탬프 조회 실패');
  }

  const totalStamps = stamps?.length ?? 0;
  if (totalStamps === 0) return empty;

  const stampsByExhibition = new Map<string, number>();
  for (const row of stamps ?? []) {
    stampsByExhibition.set(
      row.exhibition_id,
      (stampsByExhibition.get(row.exhibition_id) ?? 0) + 1
    );
  }

  // 스탬프가 있는 전시회들의 전체 작품 수 조회 → 완주 여부 비교
  const exhibitionIds = [...stampsByExhibition.keys()];
  const { data: artworks, error: artworkError } = await supabase
    .from('artworks')
    .select('exhibition_id')
    .in('exhibition_id', exhibitionIds);

  if (artworkError) {
    throw new Error('업적 집계: 작품 수 조회 실패');
  }

  const artworkCountByExhibition = new Map<string, number>();
  for (const row of artworks ?? []) {
    artworkCountByExhibition.set(
      row.exhibition_id,
      (artworkCountByExhibition.get(row.exhibition_id) ?? 0) + 1
    );
  }

  let clearedCount = 0;
  for (const [exhibitionId, stampCount] of stampsByExhibition) {
    const artworkCount = artworkCountByExhibition.get(exhibitionId) ?? 0;
    // 작품이 1개 이상이고 모든 작품을 수집했으면 완주
    if (artworkCount > 0 && stampCount >= artworkCount) {
      clearedCount += 1;
    }
  }

  const progress = { totalStamps, clearedCount };

  return {
    achievements: ACHIEVEMENTS.map((a) => ({
      id: a.id,
      achieved: isAchieved(a.condition, progress),
    })),
    totalStamps,
    clearedCount,
  };
}
