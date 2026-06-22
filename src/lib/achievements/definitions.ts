// 스탬프 투어 업적 정의 (완주 기반)
// 업적 획득 여부는 artwork_stamps 데이터로 실시간 계산한다.

export type AchievementCondition =
  | { type: 'stamps'; count: number } // 누적 스탬프 수
  | { type: 'cleared'; count: number }; // 완주(전시회의 모든 작품 수집) 전시회 수

export type AchievementDef = {
  id: string;
  icon: string; // 이모지 뱃지
  title: string; // 대표 칭호로 사용
  description: string;
  condition: AchievementCondition;
};

export const ACHIEVEMENTS: AchievementDef[] = [
  {
    id: 'first-stamp',
    icon: '👣',
    title: '첫 발자국',
    description: '첫 스탬프를 모았어요',
    condition: { type: 'stamps', count: 1 },
  },
  {
    id: 'first-clear',
    icon: '🔍',
    title: '그림 탐험가',
    description: '전시회 한 곳의 모든 그림을 찾았어요',
    condition: { type: 'cleared', count: 1 },
  },
  {
    id: 'explorer',
    icon: '🧭',
    title: '갤러리 모험가',
    description: '전시회 세 곳을 완주했어요',
    condition: { type: 'cleared', count: 3 },
  },
  {
    id: 'master',
    icon: '👑',
    title: '전시관 마스터',
    description: '전시회 다섯 곳을 완주했어요',
    condition: { type: 'cleared', count: 5 },
  },
];

// 칭호명 → 대표 이모지 아이콘 (이름표 등에서 칭호 옆 표시용)
export const TITLE_ICONS: Record<string, string> = Object.fromEntries(
  ACHIEVEMENTS.map((a) => [a.title, a.icon])
);

// 주어진 진행 상황으로 업적 달성 여부 판정
export function isAchieved(
  condition: AchievementCondition,
  progress: { totalStamps: number; clearedCount: number }
): boolean {
  if (condition.type === 'stamps') {
    return progress.totalStamps >= condition.count;
  }
  return progress.clearedCount >= condition.count;
}
