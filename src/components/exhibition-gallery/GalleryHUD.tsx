'use client';

import { IoIosArrowBack } from 'react-icons/io';
import { X } from 'lucide-react';

interface GalleryHUDProps {
  title: string;
  host: string;
  isMuted: boolean;
  onMute: () => void;
  onBack: () => void;
}

export default function GalleryHUD({
  title,
  host,
  isMuted,
  onMute,
  onBack,
}: GalleryHUDProps) {
  return (
    <div className="absolute inset-0 z-40 flex w-full items-start p-5">
      <button
        onClick={(e) => {
          e.preventDefault();
          onBack();
        }}
        className="flex cursor-pointer items-center gap-2 rounded-2xl bg-black/50 p-3 backdrop-blur-lg"
      >
        <IoIosArrowBack className="text-lg text-white/80" />
        <div className="flex flex-col">
          <p className="font-bold text-white/80">{title}</p>
          <p className="text-sm text-white/30">{host}</p>
        </div>
      </button>

      {!isMuted && (
        <div className="absolute bottom-0 left-1/2 flex -translate-x-1/2 items-center gap-2 p-5">
          <div className="flex items-center gap-3 rounded-lg bg-black/50 px-3 py-2 text-[14px] backdrop-blur-lg">
            <p className="text-white/80">숫자키 1 - 좋아요</p>
            <p className="text-white/80">숫자키 2 - 다운로드</p>
          </div>
          <button onClick={onMute} className="rounded-full bg-black/50 p-1.5">
            <X size={20} className="text-white/80" />
          </button>
        </div>
      )}
    </div>
  );
}
