'use client';

import { cn } from '@/lib/utils';
import { Button } from '../ui/button';
import { Heart } from 'lucide-react';
import { useRouter } from 'next/navigation';
import { MouseEvent, useState } from 'react';
import { toggleExhibitionLike } from '@/service/exhibitions';

interface LikeProps {
  isLiked: boolean;
  totalLikes: number;
  isLoggedIn: boolean;
  exhibitionId: string;
}

export default function LikeButton({
  isLiked,
  totalLikes,
  isLoggedIn,
  exhibitionId,
}: LikeProps) {
  const [liked, setLiked] = useState(isLiked);
  const [likes, setLikes] = useState(totalLikes); // 총 좋아요 수
  const router = useRouter();

  const handleToggleLike = async (e: MouseEvent<HTMLButtonElement>) => {
    e.preventDefault();

    if (!isLoggedIn) {
      alert('로그인이 필요한 기능입니다.');
      router.push('/login');
      return;
    }

    // 백업용
    const previousLiked = liked;
    const previousLikes = likes;
    const nextLiked = !previousLiked;

    // 낙관적
    setLiked(nextLiked);
    setLikes(previousLikes + (nextLiked ? 1 : -1));

    try {
      await toggleExhibitionLike(exhibitionId, nextLiked);
    } catch (err) {
      console.error('Detail Like Error', err);
      setLikes(previousLikes);
      setLiked(previousLiked);
    } finally {
      router.refresh();
    }
  };
  return (
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
  );
}
