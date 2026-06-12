'use client';

import Image from 'next/image';
import { Star, X } from 'lucide-react';
import { GalleryUIArtworkProps } from '@/types/gallery';

interface StampBookProps {
  artworks: GalleryUIArtworkProps[];
  onClose: () => void;
}

function StampCell({ art }: { art: GalleryUIArtworkProps }) {
  return (
    <div className="relative aspect-square overflow-hidden rounded-xl bg-[#efe7d8] shadow-[inset_0_1px_3px_rgba(64,48,33,0.15)]">
      <Image
        src={art.image_url}
        alt={art.stampedByMe ? art.title : '아직 못 찾은 그림'}
        fill
        sizes="150px"
        className={`object-cover transition-all ${
          art.stampedByMe ? '' : 'opacity-50 blur-sm grayscale'
        }`}
      />
      {art.stampedByMe ? (
        <>
          <div className="absolute top-1.5 right-1.5 flex h-9 w-9 -rotate-12 items-center justify-center rounded-full border-2 border-[#ff6b35]/90 bg-white/85">
            <span className="text-[9px] font-extrabold text-[#ff6b35]">
              찾음!
            </span>
          </div>
          <p className="absolute right-0 bottom-0 left-0 truncate bg-black/45 px-2 py-1 text-[11px] font-medium text-white">
            {art.title}
          </p>
        </>
      ) : (
        <div className="absolute inset-0 flex items-center justify-center">
          <span className="text-3xl font-extrabold text-white drop-shadow-[0_1px_3px_rgba(0,0,0,0.5)]">
            ?
          </span>
        </div>
      )}
    </div>
  );
}

export default function StampBook({ artworks, onClose }: StampBookProps) {
  const collected = artworks.filter((x) => x.stampedByMe).length;
  const mid = Math.ceil(artworks.length / 2);
  const leftArtworks = artworks.slice(0, mid);
  const rightArtworks = artworks.slice(mid);

  return (
    <div className="absolute inset-0 z-100 flex items-center justify-center bg-black/60 p-4 backdrop-blur-sm">
      <div className="animate-in fade-in w-full max-w-3xl duration-300 perspective-[1800px]">
        <div className="grid grid-cols-2 drop-shadow-2xl">
          {/* 왼쪽 페이지 — 표지가 펼쳐지듯 등장 */}
          <div className="relative flex max-h-[80vh] origin-right animate-[book-open_0.65s_ease-out] flex-col rounded-l-2xl bg-[#fdf9f0] backface-hidden transform-3d">
            {/* 헤더 */}
            <div className="flex items-center gap-2 px-6 pt-6 pb-3">
              <Star size={22} className="fill-[#f4b942] text-[#f4b942]" />
              <h2 className="text-secondary text-lg font-bold">스탬프북</h2>
              <span className="text-secondary/50 text-sm font-medium">
                {collected} / {artworks.length}
              </span>
            </div>
            {/* 그리드 앞 절반 */}
            <div className="grid grid-cols-2 content-start gap-3 overflow-y-auto px-6 pb-6">
              {leftArtworks.map((art) => (
                <StampCell key={art.id} art={art} />
              ))}
            </div>
            {/* 가운데 접힘 음영 */}
            <div className="pointer-events-none absolute inset-y-0 right-0 w-8 rounded-r-none bg-linear-to-l from-[#d8cfbd]/70 to-transparent" />
          </div>

          {/* 오른쪽 페이지 */}
          <div className="relative flex max-h-[80vh] flex-col rounded-r-2xl bg-[#fdf9f0]">
            {/* 가운데 접힘 음영 */}
            <div className="pointer-events-none absolute inset-y-0 left-0 w-8 bg-linear-to-r from-[#d8cfbd]/70 to-transparent" />
            {/* 닫기 */}
            <div className="flex justify-end px-4 pt-4">
              <button
                onClick={onClose}
                className="text-secondary/40 hover:bg-primary/10 hover:text-secondary rounded-full p-2 transition-colors"
                aria-label="스탬프북 닫기"
              >
                <X size={18} />
              </button>
            </div>
            {/* 그리드 뒤 절반 */}
            <div className="grid grid-cols-2 content-start gap-3 overflow-y-auto px-6 pb-6">
              {rightArtworks.map((art) => (
                <StampCell key={art.id} art={art} />
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
