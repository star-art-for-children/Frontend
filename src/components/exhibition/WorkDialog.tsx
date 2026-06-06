'use client';

import Image from 'next/image';
import { Download, Heart, Sparkles, X } from 'lucide-react';
import {
  Dialog,
  DialogClose,
  DialogContent,
  DialogDescription,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import { toggleArtworkLike } from '@/lib/artwork/service';
import { cn } from '@/lib/utils';
import { useOptimisticLike } from '@/hooks/useOptimisticLike';
import { useImageDownload } from '@/hooks/useImageDownload';
import { useState } from 'react';

export interface Work {
  id: string;
  title: string;
  artist: string;
  image: string;
  description?: string;
  likes: number;
  liked: boolean;
  videoUrl?: string | null;
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
  isLoggedIn = false,
  isOwner = false,
}: WorkDialogProps) {
  const { download } = useImageDownload();

  const handleImageDownload = async (imageUrl: string, title: string) => {
    try {
      await download(imageUrl, title);
    } catch (err) {
      console.error('Image Download Error', err);
      alert('이미지 다운로드에 실패했습니다. 다시 시도해주세요.');
    }
  };

  const {
    liked,
    likes,
    toggle: handleClick,
  } = useOptimisticLike({
    initialLiked: work.liked,
    initialLikes: work.likes,
    onToggle: (nextLiked) =>
      toggleArtworkLike(exhibitionId, work.id, nextLiked),
    refreshOnSuccess: true,
  });

  const [videoUrl, setVideoUrl] = useState<string | null>(work.videoUrl ?? null);
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
      alert(err instanceof Error ? err.message : '애니메이션 생성에 실패했습니다. 다시 시도해주세요.');
    } finally {
      setIsAnimating(false);
    }
  };

  return (
    <Dialog>
      <DialogTrigger className="group flex w-full flex-col overflow-hidden rounded-2xl bg-white text-left shadow-[0_2px_8px_rgba(44,40,38,0.06)] transition-all hover:shadow-[0_8px_24px_rgba(44,40,38,0.12)]">
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
      </DialogTrigger>

      <DialogContent
        className="w-[calc(100%-2rem)] max-w-4xl overflow-hidden rounded-2xl bg-white p-0 sm:max-w-lg"
        showCloseButton={false}
      >
        <DialogClose
          aria-label="닫기"
          className="absolute top-4 right-4 z-10 inline-flex h-9 w-9 items-center justify-center rounded-full bg-white shadow-md transition-colors hover:bg-white/90"
        >
          <X className="text-secondary h-4 w-4" />
        </DialogClose>
        {/* 작품 이미지 / 영상 */}
        <div className="relative aspect-4/3 w-full bg-[#F5EFE0]">
          {videoUrl ? (
            <video
              src={videoUrl}
              autoPlay
              loop
              muted
              playsInline
              className="h-full w-full object-cover"
            />
          ) : (
            <Image
              src={work.image}
              alt={work.title}
              fill
              sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 25vw"
              className="object-cover"
            />
          )}
        </div>
        {/* 정보 영역 */}
        <div className="space-y-4 p-6">
          <div className="flex items-start justify-between gap-4">
            <div className="space-y-1">
              <DialogTitle className="text-secondary text-2xl font-bold">
                {work.title}
              </DialogTitle>
              <p className="text-secondary/60 text-sm">작가: {work.artist}</p>
            </div>

            <div className="flex items-center gap-1.5">
              <button
                type="button"
                disabled={!isLoggedIn}
                onClick={handleClick}
                aria-label="좋아요"
                className={cn(
                  'text-secondary/60 hover:bg-primary/10 inline-flex items-center gap-1 rounded-full px-2 py-1 text-sm transition-colors disabled:opacity-50 disabled:hover:bg-transparent',
                  liked
                    ? 'bg-red-50 text-red-500'
                    : 'text-secondary/60 hover:bg-primary/10'
                )}
              >
                <Heart className={cn('h-4 w-4', liked && 'fill-red-500')} />
                {likes ?? 0}
              </button>
              <button
                type="button"
                onClick={() => handleImageDownload(work.image, work.title)}
                aria-label="다운로드"
                className="text-secondary/60 hover:bg-primary/10 inline-flex h-8 w-8 items-center justify-center rounded-full transition-colors"
              >
                <Download className="h-4 w-4" />
              </button>
              {isOwner && !videoUrl && (
                <button
                  type="button"
                  onClick={handleAnimate}
                  disabled={isAnimating}
                  aria-label="움직이게 하기"
                  className={cn(
                    'inline-flex items-center gap-1 rounded-full px-2 py-1 text-sm font-medium transition-colors',
                    isAnimating
                      ? 'cursor-not-allowed bg-purple-50 text-purple-300'
                      : 'bg-purple-50 text-purple-600 hover:bg-purple-100'
                  )}
                >
                  <Sparkles className="h-3.5 w-3.5" />
                  {isAnimating ? '생성 중...' : '움직이게 하기'}
                </button>
              )}
            </div>
          </div>

          {work.description && (
            <DialogDescription className="text-secondary/70 text-sm leading-relaxed">
              {work.description}
            </DialogDescription>
          )}

          <div className="border-t border-[#F0EAD8] pt-4">
            <div className="text-secondary/60 flex items-center gap-2 text-sm">
              <span className="bg-primary inline-block h-1.5 w-1.5 rounded-full" />
              <span>
                {exhibitionTitle} · {exhibitionHost}
              </span>
            </div>
          </div>

          {!isLoggedIn && (
            <p className="text-secondary/50 text-center text-xs">
              좋아요&#40;위시리스트&#41; 기능은 로그인 후 이용 가능합니다
            </p>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
}
