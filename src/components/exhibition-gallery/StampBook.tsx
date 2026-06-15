'use client';

import Image from 'next/image';
import { Star, X } from 'lucide-react';
import { GalleryUIArtworkProps } from '@/types/gallery';
import { ACHIEVEMENTS } from '@/lib/achievements/definitions';
import type { MyAchievements } from '@/lib/achievements/client';

interface StampBookProps {
  artworks: GalleryUIArtworkProps[];
  achievement: MyAchievements | null;
  onSelectTitle: (title: string | null) => void;
  onClose: () => void;
}

function StampCell({ art }: { art: GalleryUIArtworkProps }) {
  return (
    <div className="relative aspect-square overflow-hidden rounded-xl bg-[#efe7d8] shadow-[inset_0_1px_3px_rgba(64,48,33,0.15)]">
      <Image
        src={art.image_url}
        alt={art.stampedByMe ? art.title : '아직 못 찾은 그림'}
        fill
        sizes="150px"
        className={`object-cover transition-all ${
          art.stampedByMe ? '' : 'opacity-50 blur-sm grayscale'
        }`}
      />
      {art.stampedByMe ? (
        <>
          <div className="absolute top-1.5 right-1.5 flex h-9 w-9 -rotate-12 items-center justify-center rounded-full border-2 border-[#ff6b35]/90 bg-white/85">
            <span className="text-[9px] font-extrabold text-[#ff6b35]">
              찾음!
            </span>
          </div>
          <p className="absolute right-0 bottom-0 left-0 truncate bg-black/45 px-2 py-1 text-[11px] font-medium text-white">
            {art.title}
          </p>
        </>
      ) : (
        <div className="absolute inset-0 flex items-center justify-center">
          <span className="text-3xl font-extrabold text-white drop-shadow-[0_1px_3px_rgba(0,0,0,0.5)]">
            ?
          </span>
        </div>
      )}
    </div>
  );
}

function AchievementPanel({
  achievement,
  onSelectTitle,
}: {
  achievement: MyAchievements | null;
  onSelectTitle: (title: string | null) => void;
}) {
  if (!achievement) {
    return (
      <p className="text-secondary/50 px-2 py-8 text-center text-sm">
        업적을 불러오는 중...
      </p>
    );
  }

  const achievedMap = new Map(
    achievement.achievements.map((a) => [a.id, a.achieved])
  );
  const selectedTitle = achievement.selectedTitle;

  return (
    <div className="flex flex-col gap-3">
      <p className="text-secondary/50 text-xs font-medium">
        전시회 {achievement.clearedCount}곳 완주 · 뱃지를 눌러 대표 칭호를
        설정하세요
      </p>
      <div className="grid grid-cols-2 gap-2.5">
        {ACHIEVEMENTS.map((a) => {
          const achieved = achievedMap.get(a.id) ?? false;
          const isTitle = selectedTitle === a.title;
          return (
            <button
              key={a.id}
              type="button"
              disabled={!achieved}
              onClick={() => onSelectTitle(isTitle ? null : a.title)}
              className={`flex flex-col items-center gap-1 rounded-xl border px-2 py-3 text-center transition-colors ${
                achieved
                  ? isTitle
                    ? 'border-[#f0b63b] bg-[#fff7e6]'
                    : 'border-[#e8e1d7] bg-white hover:bg-[#faf7f1]'
                  : 'cursor-default border-[#eee] bg-[#f6f4f0]'
              }`}
            >
              <span
                className={`text-2xl ${achieved ? '' : 'opacity-30 grayscale'}`}
              >
                {a.icon}
              </span>
              <span
                className={`text-xs font-bold ${
                  achieved ? 'text-[#2b2724]' : 'text-[#bbb3a8]'
                }`}
              >
                {achieved ? a.title : '???'}
              </span>
              {isTitle && (
                <span className="rounded-full bg-[#f0b63b] px-2 py-0.5 text-[9px] font-bold text-white">
                  대표 칭호
                </span>
              )}
            </button>
          );
        })}
      </div>
    </div>
  );
}

export default function StampBook({
  artworks,
  achievement,
  onSelectTitle,
  onClose,
}: StampBookProps) {
  const collected = artworks.filter((x) => x.stampedByMe).length;

  return (
    <div className="absolute inset-0 z-100 flex items-center justify-center bg-black/60 p-4 backdrop-blur-sm">
      <div className="animate-in fade-in w-full max-w-3xl duration-300 perspective-[1800px]">
        <div className="grid grid-cols-2 drop-shadow-2xl">
          {/* 왼쪽 페이지 — 스탬프 수집 현황 */}
          <div className="relative flex max-h-[80vh] origin-right animate-[book-open_0.65s_ease-out] flex-col rounded-l-2xl bg-[#fdf9f0] backface-hidden transform-3d">
            <div className="flex items-center gap-2 px-6 pt-6 pb-3">
              <Star size={22} className="fill-[#f4b942] text-[#f4b942]" />
              <h2 className="text-secondary text-lg font-bold">스탬프북</h2>
              <span className="text-secondary/50 text-sm font-medium">
                {collected} / {artworks.length}
              </span>
            </div>
            <div className="grid auto-rows-max grid-cols-2 gap-3 overflow-y-auto px-6 pb-6">
              {artworks.map((art) => (
                <StampCell key={art.id} art={art} />
              ))}
            </div>
            {/* 가운데 접힘 음영 */}
            <div className="pointer-events-none absolute inset-y-0 right-0 w-8 bg-linear-to-l from-[#d8cfbd]/70 to-transparent" />
          </div>

          {/* 오른쪽 페이지 — 나의 업적 / 칭호 */}
          <div className="relative flex max-h-[80vh] flex-col rounded-r-2xl bg-[#fdf9f0]">
            {/* 가운데 접힘 음영 */}
            <div className="pointer-events-none absolute inset-y-0 left-0 w-8 bg-linear-to-r from-[#d8cfbd]/70 to-transparent" />
            <div className="flex items-center justify-between px-6 pt-6 pb-3">
              <div className="flex items-center gap-2">
                <span className="text-[20px]">🏅</span>
                <h2 className="text-secondary text-lg font-bold">나의 업적</h2>
              </div>
              <button
                onClick={onClose}
                className="text-secondary/40 hover:bg-primary/10 hover:text-secondary rounded-full p-2 transition-colors"
                aria-label="스탬프북 닫기"
              >
                <X size={18} />
              </button>
            </div>
            <div className="overflow-y-auto px-6 pb-6">
              <AchievementPanel
                achievement={achievement}
                onSelectTitle={onSelectTitle}
              />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
