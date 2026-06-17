'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { ACHIEVEMENTS } from '@/lib/achievements/definitions';
import type { UserAchievement } from '@/lib/achievements/server';

interface AchievementSectionProps {
  achievements: UserAchievement[];
  clearedCount: number;
  selectedTitle: string | null;
}

export default function AchievementSection({
  achievements,
  clearedCount,
  selectedTitle,
}: AchievementSectionProps) {
  const router = useRouter();
  const [title, setTitle] = useState<string | null>(selectedTitle);
  const [saving, setSaving] = useState(false);

  const achievedMap = new Map(achievements.map((a) => [a.id, a.achieved]));
  const achievedCount = achievements.filter((a) => a.achieved).length;

  const handleSelectTitle = async (next: string | null) => {
    if (saving) return;
    const prev = title;
    setTitle(next);
    setSaving(true);
    try {
      const res = await fetch('/api/profile/title', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ selectedTitle: next }),
      });
      if (!res.ok) throw new Error('failed');
      router.refresh();
    } catch (e) {
      console.error('칭호 변경 실패', e);
      setTitle(prev);
    } finally {
      setSaving(false);
    }
  };

  return (
    <section className="rounded-[26px] border border-[#e8e1d7] bg-white px-7 py-6 shadow-[0_2px_8px_rgba(64,48,33,0.04)]">
      <div className="mb-4 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <span className="text-[18px]">🏅</span>
          <h2 className="text-[16px] font-bold text-[#2b2724]">나의 업적</h2>
        </div>
        <span className="text-[13px] font-medium text-[#9b948c]">
          {achievedCount} / {ACHIEVEMENTS.length} · 전시회 {clearedCount}곳 완주
        </span>
      </div>

      <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
        {ACHIEVEMENTS.map((a) => {
          const achieved = achievedMap.get(a.id) ?? false;
          const isTitle = title === a.title;
          return (
            <button
              key={a.id}
              type="button"
              disabled={!achieved || saving}
              onClick={() => handleSelectTitle(isTitle ? null : a.title)}
              className={`flex flex-col items-center gap-1.5 rounded-2xl border px-3 py-4 text-center transition-colors ${
                achieved
                  ? isTitle
                    ? 'border-[#f0b63b] bg-[#fff7e6]'
                    : 'border-[#e8e1d7] bg-white hover:bg-[#faf7f1]'
                  : 'cursor-default border-[#eee] bg-[#f6f4f0]'
              }`}
              title={
                achieved
                  ? '클릭하여 대표 칭호로 설정'
                  : '아직 획득하지 못했어요'
              }
            >
              <span
                className={`text-[28px] ${achieved ? '' : 'opacity-30 grayscale'}`}
              >
                {a.icon}
              </span>
              <span
                className={`text-[13px] font-bold ${
                  achieved ? 'text-[#2b2724]' : 'text-[#bbb3a8]'
                }`}
              >
                {achieved ? a.title : '???'}
              </span>
              <span
                className={`text-[11px] leading-tight ${
                  achieved ? 'text-[#9b948c]' : 'text-[#c3bcb2]'
                }`}
              >
                {a.description}
              </span>
              {isTitle && (
                <span className="mt-0.5 rounded-full bg-[#f0b63b] px-2 py-0.5 text-[10px] font-bold text-white">
                  대표 칭호
                </span>
              )}
            </button>
          );
        })}
      </div>

      {achievedCount === 0 && (
        <p className="mt-4 text-center text-[13px] text-[#bbb3a8]">
          전시회에서 그림을 찾아 스탬프를 모으면 업적을 얻을 수 있어요!
        </p>
      )}
    </section>
  );
}
