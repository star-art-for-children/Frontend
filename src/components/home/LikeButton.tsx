'use client';

import { useState, type MouseEvent } from 'react';
import { Heart } from 'lucide-react';
import { cn } from '@/lib/utils';
import { useRouter } from 'next/navigation';
import { toggleExhibitionLike } from '@/lib/exhibition/service';

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
  const router = useRouter();
  const [liked, setLiked] = useState(initialLiked);
  const [likes, setLikes] = useState(initialLikes); // 총 좋아요 수
  const [isPending, setIsPending] = useState(false);

  const handleClick = async (e: MouseEvent<HTMLButtonElement>) => {
    e.preventDefault();
    e.stopPropagation();

    if (!isLoggedIn) {
      alert('로그인이 필요한 기능입니다.');
      router.push('/login');
      return;
    }

    if (isPending) return;

    // 백업용
    const previousLiked = liked;
    const previousLikes = likes;
    const nextLiked = !previousLiked;

    // 낙관적
    setLiked(nextLiked);
    setLikes(previousLikes + (nextLiked ? 1 : -1));

    try {
      setIsPending(true);
      await toggleExhibitionLike(exhibitionId, nextLiked);
    } catch (err) {
      console.error('Like Error:', err);
      setLiked(previousLiked);
      setLikes(previousLikes);
    } finally {
      setIsPending(false);
    }
  };

  return (
    <button
      type="button"
      onClick={handleClick}
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
