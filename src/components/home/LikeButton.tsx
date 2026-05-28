'use client';

import { Heart } from 'lucide-react';
import { cn } from '@/lib/utils';
import { toggleExhibitionLike } from '@/lib/exhibition/service';
import { useOptimisticLike } from '@/hooks/useOptimisticLike';

interface LikeButtonProps {
  exhibitionId: string;
  initialLikes: number;
  initialLiked?: boolean;
  isLoggedIn?: boolean;
}

export default function LikeButton({
  exhibitionId,
  initialLikes,
  initialLiked = false,
  isLoggedIn = false,
}: LikeButtonProps) {
  const { liked, likes, isPending, toggle } = useOptimisticLike({
    initialLiked,
    initialLikes,
    onToggle: (nextLiked) => toggleExhibitionLike(exhibitionId, nextLiked),
    isLoggedIn,
  });

  return (
    <button
      type="button"
      onClick={toggle}
      disabled={isPending}
      aria-label={liked ? '좋아요 취소' : '좋아요'}
      aria-pressed={liked}
      className={cn(
        'inline-flex items-center gap-1 rounded-full px-1.5 py-0.5 transition-colors',
        isLoggedIn ? 'group/like cursor-pointer' : 'cursor-default opacity-70'
      )}
    >
      <Heart
        className={cn(
          'h-3.5 w-3.5 transition-colors',
          liked
            ? 'fill-red-500 text-red-500'
            : isLoggedIn
              ? 'text-secondary/60 group-hover/like:text-red-500'
              : 'text-secondary/60'
        )}
      />
      <span
        className={cn(
          liked
            ? 'text-red-500'
            : isLoggedIn
              ? 'text-secondary/60 group-hover/like:text-red-500'
              : 'text-secondary/60'
        )}
      >
        {likes}
      </span>
    </button>
  );
}
