'use client';

import { useState } from 'react';
import { likesToggle, toggleReaction } from '@/lib/artwork/service';
import { useOptimisticLike } from '@/hooks/useOptimisticLike';
import { useImageDownload } from '@/hooks/useImageDownload';
import { Artwork } from '@/types/artwork';
import ArtworkDetailContent from '@/components/ui/ArtworkDetailContent';

interface ArtworkModalProps {
  artwork: Artwork;
  onClose: () => void;
  onLikeChange?: (liked: boolean, newCount: number) => void;
  isLoggedIn?: boolean;
}

export default function ArtworkModal({
  artwork,
  onClose,
  onLikeChange,
  isLoggedIn,
}: ArtworkModalProps) {
  const {
    liked,
    likes: likesCount,
    isPending,
    toggle: handleLike,
  } = useOptimisticLike({
    initialLiked: artwork.isLiked,
    initialLikes: artwork.likesCount,
    onToggle: () => likesToggle(artwork.exhibitionId, artwork.id),
    onSuccess: (nextLiked, nextLikes) => onLikeChange?.(nextLiked, nextLikes),
  });

  // 이모지 반응 (좋아요와 별개) — 낙관적 업데이트
  const [reactions, setReactions] = useState<Record<string, number>>(
    artwork.reactions ?? {}
  );
  const [myReaction, setMyReaction] = useState<string | null>(
    artwork.myReaction ?? null
  );

  const handleReaction = async (emoji: string) => {
    if (!isLoggedIn) return;

    const prevReactions = reactions;
    const prevMine = myReaction;

    const next = { ...reactions };
    if (prevMine) next[prevMine] = Math.max((next[prevMine] ?? 1) - 1, 0);
    let nextMine: string | null;
    if (prevMine === emoji) {
      nextMine = null;
    } else {
      next[emoji] = (next[emoji] ?? 0) + 1;
      nextMine = emoji;
    }
    setReactions(next);
    setMyReaction(nextMine);

    try {
      await toggleReaction(artwork.exhibitionId, artwork.id, emoji);
    } catch (err) {
      console.error('reaction toggle error', err);
      setReactions(prevReactions);
      setMyReaction(prevMine);
    }
  };

  const { download } = useImageDownload();

  const handleDownload = async () => {
    try {
      await download(artwork.imageUrl, `${artwork.title}.jpg`);
    } catch (e) {
      console.error('이미지 다운로드 실패:', e);
    }
  };

  return (
    <ArtworkDetailContent
      image={artwork.imageUrl}
      title={artwork.title}
      artist={artwork.artist}
      description={artwork.description}
      likes={likesCount}
      liked={liked}
      isPending={isPending}
      isLoggedIn={isLoggedIn}
      exhibitionTitle={artwork.exhibitionTitle}
      host={artwork.academyName}
      onClose={onClose}
      onLike={handleLike}
      onDownload={handleDownload}
      reactions={reactions}
      myReaction={myReaction}
      onReact={handleReaction}
    />
  );
}
