'use client';

import Image from 'next/image';
import { useEffect, useState } from 'react';
import { cn } from '@/lib/utils';
import { DIALOG_CARD_CLASS, DIALOG_OVERLAY_CLASS } from '@/lib/styles/dialog';

export interface ArtworkDetailContentProps {
  image: string;
  title: string;
  artist: string;
  description?: string;
  likes: number;
  liked: boolean;
  isPending: boolean;
  isLoggedIn?: boolean;
  exhibitionTitle: string;
  host: string;
  onClose: () => void;
  onLike: () => void;
  onDownload: () => void;
  videoUrl?: string | null;
  isOwner?: boolean;
  isAnimating?: boolean;
  onAnimate?: () => void;
  reactions?: Record<string, number>;
  myReaction?: string | null;
  onReact?: (emoji: string) => void;
}

export default function ArtworkDetailContent({
  image,
  title,
  artist,
  description,
  likes,
  liked,
  isPending,
  isLoggedIn,
  exhibitionTitle,
  host,
  onClose,
  onLike,
  onDownload,
  videoUrl,
  isOwner = false,
  isAnimating = false,
  onAnimate,
  reactions = {},
  myReaction = null,
  onReact,
}: ArtworkDetailContentProps) {
  const [showLoginHint, setShowLoginHint] = useState(false);
  const [showVideo, setShowVideo] = useState(false);

  const REACTIONS = ['❤️', '😍', '😮', '👏'];

  const handleReactClick = (emoji: string) => {
    if (isLoggedIn === false) {
      setShowLoginHint(true);
      return;
    }
    onReact?.(emoji);
  };

  useEffect(() => {
    const handleKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
    };
    document.addEventListener('keydown', handleKey);
    document.body.style.overflow = 'hidden';
    return () => {
      document.removeEventListener('keydown', handleKey);
      document.body.style.overflow = '';
    };
  }, [onClose]);

  const handleLikeClick = () => {
    if (isLoggedIn === false) {
      setShowLoginHint(true);
      return;
    }
    onLike();
  };

  return (
    <div
      className={cn(
        'fixed top-0 bottom-0 left-0 z-50 flex w-screen items-center justify-center px-4',
        DIALOG_OVERLAY_CLASS
      )}
      onClick={onClose}
    >
      <div
        className={cn(
          DIALOG_CARD_CLASS,
          'relative max-w-132.5 overflow-hidden'
        )}
        onClick={(e) => e.stopPropagation()}
      >
        {/* 닫기 버튼 */}
        <button
          onClick={onClose}
          className="absolute top-4 right-4 z-10 flex h-9 w-9 items-center justify-center rounded-full bg-white/90 text-[#1A1A1A] shadow-sm transition-colors hover:bg-white"
        >
          <svg width="14" height="14" viewBox="0 0 14 14" fill="none">
            <path
              d="M1 1l12 12M13 1L1 13"
              stroke="currentColor"
              strokeWidth="1.8"
              strokeLinecap="round"
            />
          </svg>
        </button>

        {/* 이미지 / 영상 */}
        <div className="relative aspect-4/3 w-full bg-[#E8E5DE]">
          {showVideo && videoUrl ? (
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
              src={image}
              alt={title}
              fill
              className="object-cover"
              sizes="530px"
            />
          )}
          {videoUrl && (
            <button
              onClick={() => setShowVideo((v) => !v)}
              className="absolute right-3 bottom-3 flex items-center gap-1.5 rounded-full bg-black/50 px-3 py-1.5 text-[12px] font-medium text-white backdrop-blur-sm transition-colors hover:bg-black/70"
            >
              {showVideo ? '🖼 이미지 보기' : '▶ 영상 보기'}
            </button>
          )}
        </div>

        {/* 정보 패널 */}
        <div className="bg-white px-6 pt-5 pb-6">
          <div className="mb-1 flex items-start justify-between gap-3">
            <h2 className="text-[20px] font-bold text-[#1A1A1A]">{title}</h2>
            <div className="flex shrink-0 items-center gap-1.5">
              {/* 좋아요 */}
              <button
                onClick={handleLikeClick}
                disabled={isPending}
                className="flex items-center gap-1.5 rounded-full border border-[#EDEBE4] px-3.5 py-1.5 transition-colors hover:bg-[#F5F0E8] disabled:opacity-50"
              >
                <svg width="14" height="14" viewBox="0 0 16 16" fill="none">
                  <path
                    d="M8 13.5S2 9.8 2 5.9A3.4 3.4 0 018 3.6 3.4 3.4 0 0114 5.9C14 9.8 8 13.5 8 13.5z"
                    stroke={liked ? '#F4845F' : '#1A1A1A'}
                    fill={liked ? '#F4845F' : 'none'}
                    strokeWidth="1.4"
                    strokeLinejoin="round"
                  />
                </svg>
                <span className="text-[13px] font-medium text-[#1A1A1A]">
                  {likes}
                </span>
              </button>
              {/* 다운로드 */}
              <button
                onClick={onDownload}
                className="flex h-8 w-8 items-center justify-center rounded-full border border-[#EDEBE4] text-[#1A1A1A] transition-colors hover:bg-[#F5F0E8]"
              >
                <svg width="14" height="14" viewBox="0 0 16 16" fill="none">
                  <path
                    d="M8 2v8M5 7l3 3 3-3"
                    stroke="currentColor"
                    strokeWidth="1.4"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  />
                  <path
                    d="M2 12h12"
                    stroke="currentColor"
                    strokeWidth="1.4"
                    strokeLinecap="round"
                  />
                </svg>
              </button>
              {/* 움직이게 하기 */}
              {isOwner && !videoUrl && onAnimate && (
                <button
                  onClick={onAnimate}
                  disabled={isAnimating}
                  className={`flex items-center gap-1.5 rounded-full border px-3.5 py-1.5 text-[13px] font-medium transition-colors ${
                    isAnimating
                      ? 'cursor-not-allowed border-purple-200 text-purple-300'
                      : 'border-purple-200 text-purple-600 hover:bg-purple-50'
                  }`}
                >
                  ✨ {isAnimating ? '생성 중...' : '움직이게 하기'}
                </button>
              )}
            </div>
          </div>

          <p className="mb-3 text-[13px] text-[#888780]">작가: {artist}</p>

          {description && (
            <p className="mb-4 text-[14px] leading-relaxed text-[#444340]">
              {description}
            </p>
          )}

          {/* 이모지 반응 */}
          <div className="mb-4 flex flex-wrap gap-2">
            {REACTIONS.map((emoji) => {
              const count = reactions[emoji] ?? 0;
              const active = myReaction === emoji;
              return (
                <button
                  key={emoji}
                  onClick={() => handleReactClick(emoji)}
                  className={cn(
                    'flex items-center gap-1.5 rounded-full border px-3 py-1.5 text-[13px] transition-colors',
                    active
                      ? 'border-[#F4845F] bg-[#FDEEE8]'
                      : 'border-[#EDEBE4] hover:bg-[#F5F0E8]'
                  )}
                >
                  <span className="text-[15px]">{emoji}</span>
                  {count > 0 && (
                    <span
                      className={cn(
                        'font-medium',
                        active ? 'text-[#D9663F]' : 'text-[#888780]'
                      )}
                    >
                      {count}
                    </span>
                  )}
                </button>
              );
            })}
          </div>

          <div className="flex items-center gap-1.5">
            <span className="h-1.5 w-1.5 rounded-full bg-[#F4845F]" />
            <span className="text-[12px] text-[#888780]">
              {exhibitionTitle} · {host}
            </span>
          </div>

          {showLoginHint && (
            <p className="mt-3 text-center text-xs text-[#E5484D]">
              좋아요 기능은 로그인 후 이용 가능합니다
            </p>
          )}
        </div>
      </div>
    </div>
  );
}
