'use client';

import { ArrowRight, Calendar, Heart, Settings, Star } from 'lucide-react';
import Link from 'next/link';
import type { ExhibitionDetailItem } from '@/lib/exhibition/server';
import { formatDate } from '@/lib/exhibition/dateStatus';
import { Button } from '../ui/button';
import { cn } from '@/lib/utils';
import { toggleExhibitionLike } from '@/lib/exhibition/service';
import { useOptimisticLike } from '@/hooks/useOptimisticLike';

interface ActionProps {
  exhibition: ExhibitionDetailItem;
  isOwner: boolean;
  isLiked: boolean;
  isLoggedIn: boolean;
}

export default function ExhibitionActionBar({
  exhibition,
  isOwner,
  isLiked,
  isLoggedIn,
}: ActionProps) {
  const {
    liked,
    likes,
    toggle: handleToggleLike,
  } = useOptimisticLike({
    initialLiked: isLiked,
    initialLikes: exhibition.totalLikes,
    onToggle: (nextLiked) => toggleExhibitionLike(exhibition.id, nextLiked),
    isLoggedIn,
    refreshOnSuccess: true,
  });

  const dateText = formatDate(
    exhibition.startDate,
    exhibition.endDate ?? undefined
  );
  return (
    <section className="flex flex-wrap items-center justify-between gap-4 rounded-2xl bg-white p-5 shadow-[0_2px_8px_rgba(44,40,38,0.06)]">
      <div className="text-secondary/70 flex flex-wrap items-center gap-x-6 gap-y-2 text-sm">
        <span className="inline-flex items-center gap-1.5">
          <Calendar className="text-primary h-4 w-4" />
          {dateText}
        </span>
        <span className="inline-flex items-center gap-1.5">
          <Heart className="h-4 w-4 text-red-500" />총 좋아요 {likes}
        </span>
        <span className="inline-flex items-center gap-1.5">
          <Star className="text-primary h-4 w-4" />
          작품 {exhibition.works?.length}점
        </span>
      </div>

      <div className="flex flex-wrap items-center gap-2">
        {isOwner && (
          <Link
            href={`/exhibitions/${exhibition.id}/manage`}
            className="text-secondary/60 hover:bg-primary/20 inline-flex h-9 items-center gap-1.5 rounded-xl bg-[#FAF7F2] px-2.5 text-sm font-medium transition-colors"
          >
            <Settings className="h-4 w-4" />
            전시회 관리
          </Link>
        )}
        <Button
          onClick={handleToggleLike}
          size="lg"
          className={cn(
            'rounded-xl transition-colors',
            liked
              ? 'bg-red-50 text-red-500 hover:bg-red-100'
              : 'text-secondary/60 hover:bg-primary/20 bg-[#FAF7F2]'
          )}
        >
          <Heart className={cn('h-4 w-4', liked && 'fill-red-500')} />
          {liked ? '좋아요 취소' : '좋아요'}
        </Button>
        <Link
          href={`/gallery/${exhibition.id}`}
          className="bg-primary inline-flex h-9 items-center gap-1.5 rounded-xl px-2.5 text-sm font-medium text-white transition-colors hover:bg-[#E09415]"
        >
          <span>🎨</span>
          전시회 입장하기
          <ArrowRight className="h-4 w-4" />
        </Link>
      </div>
    </section>
  );
}
