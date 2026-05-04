'use client';

import Image from 'next/image';
import { Artwork } from './Types';

interface ArtworkCardProps {
  artwork: Artwork;
  onClick: () => void;
}

export default function ArtworkCard({ artwork, onClick }: ArtworkCardProps) {
  return (
    <div
      onClick={onClick}
      className="group cursor-pointer overflow-hidden rounded-2xl border border-[#EDEBE4] bg-white transition-shadow duration-200 hover:shadow-[0_4px_20px_rgba(0,0,0,0.10)]"
    >
      {/* 이미지 */}
      <div className="relative aspect-4/3 w-full overflow-hidden bg-[#F3F4F6]">
        <Image
          src={artwork.imageUrl}
          alt={artwork.title}
          fill
          className="object-cover transition-transform duration-300 group-hover:scale-105"
          sizes="(max-width: 1080px) 25vw, 270px"
        />
      </div>

      {/* 텍스트 */}
      <div className="px-4 py-3.5">
        {/* 작품명 */}
        <p className="mb-0.5 truncate text-[15px] font-semibold text-[#1A1A1A]">
          {artwork.title}
        </p>

        {/* 전시회명 */}
        <p className="mb-2 truncate text-[12px] text-[#BCBAB2]">
          {artwork.exhibitionTitle}
        </p>

        {/* 좋아요 수 */}
        <div className="flex items-center gap-1 text-[#BCBAB2]">
          <svg width="13" height="13" viewBox="0 0 16 16" fill="none">
            <path
              d="M8 13.5S2 9.8 2 5.9A3.4 3.4 0 018 3.6 3.4 3.4 0 0114 5.9C14 9.8 8 13.5 8 13.5z"
              stroke="currentColor"
              strokeWidth="1.4"
              strokeLinejoin="round"
            />
          </svg>
          <span className="text-[12px]">{artwork.likesCount}</span>
        </div>
      </div>
    </div>
  );
}
