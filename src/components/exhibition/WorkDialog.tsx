'use client';

import Image from 'next/image';
import { useRef, useState } from 'react';
import { likesToggle, toggleReaction } from '@/lib/artwork/service';
import { useOptimisticLike } from '@/hooks/useOptimisticLike';
import { useImageDownload } from '@/hooks/useImageDownload';
import ArtworkDetailContent from '@/components/ui/ArtworkDetailContent';

export interface Work {
  id: string;
  title: string;
  artist: string;
  image: string;
  description?: string;
  likes: number;
  liked: boolean;
  videoUrl?: string | null;
  reactions?: Record<string, number>;
  myReaction?: string | null;
}

interface WorkDialogProps {
  work: Work;
  exhibitionId: string;
  exhibitionTitle: string;
  exhibitionHost: string;
  isLoggedIn?: boolean;
  isOwner?: boolean;
}

export default function WorkDialog({
  work,
  exhibitionId,
  exhibitionTitle,
  exhibitionHost,
  isLoggedIn,
  isOwner = false,
}: WorkDialogProps) {
  const [open, setOpen] = useState(false);

  const {
    liked,
    likes,
    isPending,
    toggle: handleLike,
  } = useOptimisticLike({
    initialLiked: work.liked,
    initialLikes: work.likes,
    onToggle: () => likesToggle(exhibitionId, work.id),
    refreshOnSuccess: true,
  });

  // 이모지 반응 (좋아요와 별개) — 낙관적 업데이트
  const [reactions, setReactions] = useState<Record<string, number>>(
    work.reactions ?? {}
  );
  const [myReaction, setMyReaction] = useState<string | null>(
    work.myReaction ?? null
  );
  // 반응 요청 직렬화 — 응답 순서 역전으로 인한 UI/DB 불일치 방지
  const reactionPendingRef = useRef(false);

  const handleReaction = async (emoji: string) => {
    if (!isLoggedIn || reactionPendingRef.current) return;

    const prevReactions = reactions;
    const prevMine = myReaction;

    // 낙관적 계산: 같은 이모지 → 해제, 다른 이모지 → 교체
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

    reactionPendingRef.current = true;
    try {
      await toggleReaction(exhibitionId, work.id, emoji);
    } catch (err) {
      console.error('reaction toggle error', err);
      setReactions(prevReactions);
      setMyReaction(prevMine);
    } finally {
      reactionPendingRef.current = false;
    }
  };

  const { download } = useImageDownload();

  const handleDownload = async () => {
    try {
      await download(work.image, `${work.title}.jpg`);
    } catch (err) {
      console.error('Image Download Error', err);
      alert('이미지 다운로드에 실패했습니다. 다시 시도해주세요.');
    }
  };

  const [videoUrl, setVideoUrl] = useState<string | null>(
    work.videoUrl ?? null
  );
  const [isAnimating, setIsAnimating] = useState(false);

  const handleAnimate = async () => {
    if (isAnimating) return;
    setIsAnimating(true);
    try {
      const res = await fetch(
        `/api/exhibitions/${exhibitionId}/artworks/${work.id}/animate`,
        { method: 'POST' }
      );
      if (!res.ok) {
        const { message } = await res.json().catch(() => ({}));
        throw new Error(message || 'animate failed');
      }
      const { videoUrl: url } = await res.json();
      setVideoUrl(url);
    } catch (err) {
      console.error(err);
      alert(
        err instanceof Error
          ? err.message
          : '애니메이션 생성에 실패했습니다. 다시 시도해주세요.'
      );
    } finally {
      setIsAnimating(false);
    }
  };

  return (
    <>
      <button
        onClick={() => setOpen(true)}
        className="group flex w-full flex-col overflow-hidden rounded-2xl bg-white text-left shadow-[0_2px_8px_rgba(44,40,38,0.06)] transition-all hover:shadow-[0_8px_24px_rgba(44,40,38,0.12)]"
      >
        <div className="relative aspect-4/3 overflow-hidden bg-[#F5EFE0]">
          <Image
            src={work.image}
            alt={work.title}
            fill
            sizes="(min-width: 1024px) 25vw, (min-width: 640px) 50vw, 100vw"
            className="object-cover transition-transform duration-300 group-hover:scale-105"
          />
        </div>
        <div className="p-4">
          <h3 className="text-secondary truncate font-bold">{work.title}</h3>
          <p className="text-secondary/60 mt-1 truncate text-sm">
            {work.artist}
          </p>
        </div>
      </button>

      {open && (
        <ArtworkDetailContent
          image={work.image}
          title={work.title}
          artist={work.artist}
          description={work.description}
          likes={likes}
          liked={liked}
          isPending={isPending}
          isLoggedIn={isLoggedIn}
          exhibitionTitle={exhibitionTitle}
          host={exhibitionHost}
          onClose={() => setOpen(false)}
          onLike={handleLike}
          onDownload={handleDownload}
          videoUrl={videoUrl}
          isOwner={isOwner}
          isAnimating={isAnimating}
          onAnimate={handleAnimate}
          reactions={reactions}
          myReaction={myReaction}
          onReact={handleReaction}
        />
      )}
    </>
  );
}
