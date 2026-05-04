'use client';

import { useState } from 'react';
import ArtworkCard from '@/components/myArtworks/ArtworkCard';
import ArtworkModal from '@/components/myArtworks/ArtworkModal';
import FilterTab from '@/components/myArtworks/FilterTab';
import { MOCK_ARTWORKS } from '@/components/myArtworks/MockData';
import { Artwork, FilterType } from '@/components/myArtworks/Types';

export default function MyArtworksPage() {
  const [filter, setFilter] = useState<FilterType>('latest');
  const [search, setSearch] = useState<string>('');
  const [selectedArtwork, setSelectedArtwork] = useState<Artwork | null>(null);

  const sorted = [...MOCK_ARTWORKS]
    .filter((a) => a.title.toLowerCase().includes(search.toLowerCase()))
    .sort((a, b) => {
      if (filter === 'latest')
        return (
          new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
        );
      if (filter === 'oldest')
        return (
          new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime()
        );
      return b.likesCount - a.likesCount;
    });

  return (
    <>
      <main className="min-h-screen bg-[#F5F0E8]">
        <div className="mx-auto max-w-[1080px] px-6 py-10">
          {/* 헤더 영역 */}
          <div className="mb-6 flex items-start justify-between">
            <div>
              <h1 className="mb-1 text-[28px] font-bold tracking-tight text-[#1A1A1A]">
                내 작품 모아보기
              </h1>
              <p className="text-[14px] text-[#888780]">
                나의 작품 {MOCK_ARTWORKS.length}점
              </p>
            </div>

            {/* 검색창 */}
            <div className="relative">
              <svg
                className="absolute top-1/2 left-3.5 -translate-y-1/2 text-[#BCBAB2]"
                width="15"
                height="15"
                viewBox="0 0 16 16"
                fill="none"
              >
                <circle
                  cx="7"
                  cy="7"
                  r="5.5"
                  stroke="currentColor"
                  strokeWidth="1.5"
                />
                <path
                  d="M11 11l2.5 2.5"
                  stroke="currentColor"
                  strokeWidth="1.5"
                  strokeLinecap="round"
                />
              </svg>
              <input
                type="text"
                placeholder="작품 검색..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="w-[220px] rounded-full border border-[#EDEBE4] bg-white py-2.5 pr-4 pl-9 text-[14px] text-[#1A1A1A] transition-colors outline-none placeholder:text-[#BCBAB2] focus:border-[#f4b942]"
              />
            </div>
          </div>

          {/* 필터 탭 */}
          <FilterTab value={filter} onChange={setFilter} />

          {/* 작품 그리드 */}
          {sorted.length > 0 ? (
            <div className="grid grid-cols-4 gap-5">
              {sorted.map((artwork) => (
                <ArtworkCard
                  key={artwork.id}
                  artwork={artwork}
                  onClick={() => setSelectedArtwork(artwork)}
                />
              ))}
            </div>
          ) : (
            <div className="flex flex-col items-center justify-center py-32 text-[#BCBAB2]">
              <span className="mb-4 text-5xl">🎨</span>
              <p className="text-[15px] font-medium text-[#888780]">
                검색 결과가 없습니다.
              </p>
            </div>
          )}
        </div>
      </main>

      {/* 작품 상세 모달 */}
      {selectedArtwork && (
        <ArtworkModal
          artwork={selectedArtwork}
          onClose={() => setSelectedArtwork(null)}
        />
      )}
    </>
  );
}
