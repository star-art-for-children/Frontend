'use client';

import { useState } from 'react';
import ArtworkCard from '@/components/my-artworks/ArtworkCard';
import ArtworkModal from '@/components/my-artworks/ArtworkModal';
import FilterTab from '@/components/my-artworks/FilterTab';
import { sortArtworks } from '@/lib/artwork/sort';
import type { Artwork, FilterType } from '@/types/artwork';

interface ArtworksScreenProps {
  artworks: Artwork[];
}

export default function ArtworksScreen({
  artworks: initialArtworks,
}: ArtworksScreenProps) {
  const [artworks, setArtworks] = useState<Artwork[]>(initialArtworks);
  const [filter, setFilter] = useState<FilterType>('latest');
  const [selectedArtwork, setSelectedArtwork] = useState<Artwork | null>(null);

  const sorted = sortArtworks(artworks, filter);

  return (
    <>
      <main className="min-h-screen bg-[#F5F0E8]">
        <div className="mx-auto max-w-[1080px] px-6 py-10">
          <div className="mb-6">
            <h1 className="mb-1 text-[28px] font-bold tracking-tight text-[#1A1A1A]">
              내 작품 모아보기
            </h1>
            <p className="text-[14px] text-[#888780]">
              나의 작품 {artworks.length}점
            </p>
          </div>

          <FilterTab value={filter} onChange={setFilter} />

          {sorted.length > 0 ? (
            <div className="grid grid-cols-4 gap-5">
              {sorted.map((artwork) => (
                <ArtworkCard
                  key={artwork.id}
                  artwork={artwork}
                  subtitle={artwork.exhibitionTitle}
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

      {selectedArtwork && (
        <ArtworkModal
          key={selectedArtwork.id}
          artwork={selectedArtwork}
          isLoggedIn
          onClose={() => setSelectedArtwork(null)}
          onLikeChange={(liked, newCount) => {
            setArtworks((prev) =>
              prev.map((a) =>
                a.id === selectedArtwork.id
                  ? { ...a, likesCount: newCount, isLiked: liked }
                  : a
              )
            );
          }}
        />
      )}
    </>
  );
}
