'use client';

import { useEffect } from 'react';
import Image from 'next/image';
import { Artwork } from './Types';

interface ArtworkModalProps {
  artwork: Artwork;
  onClose: () => void;
}

export default function ArtworkModal({ artwork, onClose }: ArtworkModalProps) {
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

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 px-4"
      onClick={onClose}
    >
      <div
        className="relative w-full max-w-132.5 overflow-hidden rounded-3xl shadow-2xl"
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

        {/* 이미지 */}
        <div className="relative aspect-4/3 w-full bg-[#E8E5DE]">
          <Image
            src={artwork.imageUrl}
            alt={artwork.title}
            fill
            className="object-cover"
            sizes="530px"
          />
        </div>

        {/* 정보 패널 */}
        <div className="bg-white px-6 pt-5 pb-6">
          {/* 제목 + 액션 버튼들 */}
          <div className="mb-1 flex items-start justify-between gap-3">
            <h2 className="text-[20px] font-bold text-[#1A1A1A]">
              {artwork.title}
            </h2>
            <div className="flex shrink-0 items-center gap-1.5">
              {/* 좋아요 */}
              <div className="flex items-center gap-1.5 rounded-full border border-[#EDEBE4] px-3.5 py-1.5">
                <svg width="14" height="14" viewBox="0 0 16 16" fill="none">
                  <path
                    d="M8 13.5S2 9.8 2 5.9A3.4 3.4 0 018 3.6 3.4 3.4 0 0114 5.9C14 9.8 8 13.5 8 13.5z"
                    stroke="#1A1A1A"
                    strokeWidth="1.4"
                    strokeLinejoin="round"
                  />
                </svg>
                <span className="text-[13px] font-medium text-[#1A1A1A]">
                  {artwork.likesCount}
                </span>
              </div>
              {/* 저장 */}
              <button className="flex h-8 w-8 items-center justify-center rounded-full border border-[#EDEBE4] text-[#1A1A1A] transition-colors hover:bg-[#F5F0E8]">
                <svg width="14" height="14" viewBox="0 0 16 16" fill="none">
                  <rect
                    x="3"
                    y="2"
                    width="10"
                    height="12"
                    rx="1.5"
                    stroke="currentColor"
                    strokeWidth="1.4"
                  />
                  <path
                    d="M3 6h10"
                    stroke="currentColor"
                    strokeWidth="1.4"
                    strokeLinecap="round"
                  />
                </svg>
              </button>
              {/* 다운로드 */}
              <button className="flex h-8 w-8 items-center justify-center rounded-full border border-[#EDEBE4] text-[#1A1A1A] transition-colors hover:bg-[#F5F0E8]">
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
            </div>
          </div>

          {/* 작가 */}
          <p className="mb-3 text-[13px] text-[#888780]">
            작가: {artwork.artist}
          </p>

          {/* 설명 */}
          <p className="mb-4 text-[14px] leading-relaxed text-[#444340]">
            {artwork.description}
          </p>

          {/* 전시회 · 미술학원 */}
          <div className="flex items-center gap-1.5">
            <span className="h-1.5 w-1.5 rounded-full bg-[#F4845F]" />
            <span className="text-[12px] text-[#888780]">
              {artwork.exhibitionTitle} · {artwork.academyName}
            </span>
          </div>
        </div>
      </div>
    </div>
  );
}
