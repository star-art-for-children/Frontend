import type { UserAchievementResult } from './server';

export type MyAchievements = UserAchievementResult & {
  selectedTitle: string | null;
};

// 현재 유저의 업적 현황 + 대표 칭호 조회
export async function fetchMyAchievements(): Promise<MyAchievements> {
  const res = await fetch('/api/achievements');
  if (!res.ok) throw new Error('failed to fetch achievements');
  return res.json();
}

// 대표 칭호 설정/해제 (획득한 업적의 칭호만 허용 — 서버 검증)
export async function updateSelectedTitle(
  selectedTitle: string | null
): Promise<{ selectedTitle: string | null }> {
  const res = await fetch('/api/profile/title', {
    method: 'PATCH',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ selectedTitle }),
  });
  if (!res.ok) throw new Error('failed to update title');
  return res.json();
}
