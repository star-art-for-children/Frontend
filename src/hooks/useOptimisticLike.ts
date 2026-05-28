'use client';

import { useState, type MouseEvent } from 'react';
import { useRouter } from 'next/navigation';

interface UseOptimisticLikeOptions {
  initialLiked: boolean;
  initialLikes: number;
  onToggle: (nextLiked: boolean) => Promise<unknown>;
  onSuccess?: (nextLiked: boolean, nextLikes: number) => void;
  // 명시적으로 false인 경우에만 로그인 알림 + /login 리다이렉트
  isLoggedIn?: boolean;
  refreshOnSuccess?: boolean;
}

export const useOptimisticLike = ({
  initialLiked,
  initialLikes,
  onToggle,
  onSuccess,
  isLoggedIn,
  refreshOnSuccess = false,
}: UseOptimisticLikeOptions) => {
  const router = useRouter();
  const [liked, setLiked] = useState(initialLiked);
  const [likes, setLikes] = useState(initialLikes);
  const [isPending, setIsPending] = useState(false);

  const toggle = async (e?: MouseEvent) => {
    e?.preventDefault();
    e?.stopPropagation();

    if (isLoggedIn === false) {
      alert('로그인이 필요한 기능입니다.');
      router.push('/login');
      return;
    }

    if (isPending) return;

    const previousLiked = liked;
    const previousLikes = likes;
    const nextLiked = !previousLiked;
    const nextLikes = previousLikes + (nextLiked ? 1 : -1);

    setLiked(nextLiked);
    setLikes(nextLikes);
    setIsPending(true);

    try {
      await onToggle(nextLiked);
      if (refreshOnSuccess) router.refresh();
      onSuccess?.(nextLiked, nextLikes);
    } catch (err) {
      console.error('Like toggle error:', err);
      setLiked(previousLiked);
      setLikes(previousLikes);
    } finally {
      setIsPending(false);
    }
  };

  return { liked, likes, isPending, toggle };
};
