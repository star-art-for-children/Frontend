'use client';

import { useState } from 'react';
import ArtworkModal from '@/components/my-artworks/ArtworkModal';
import FilterTab from '@/components/my-artworks/FilterTab';
import type { Artwork, FilterType } from '@/types/artwork';
import WishlistCard from './WishlistCard';

interface WishlistScreenProps {
  artworks: Artwork[];
}

export default function WishlistScreen({
  artworks: initialArtworks,
}: WishlistScreenProps) {
  const [artworks, setArtworks] = useState<Artwork[]>(initialArtworks);
  const [filter, setFilter] = useState<FilterType>('latest');
  const [selectedArtwork, setSelectedArtwork] = useState<Artwork | null>(null);

  const sorted = [...artworks].sort((a, b) => {
    if (filter === 'latest')
      return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime();
    if (filter === 'oldest')
      return new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime();
    return b.likesCount - a.likesCount;
  });

  return (
    <>
      <main className="min-h-screen bg-[#F5F0E8]">
        <div className="mx-auto max-w-[1080px] px-6 py-10">
          <div className="mb-6">
            <h1 className="mb-1 text-[28px] font-bold tracking-tight text-[#1A1A1A]">
              위시리스트
            </h1>
            <p className="text-[14px] text-[#888780]">
              저장한 작품 {artworks.length}점
            </p>
          </div>

          <FilterTab value={filter} onChange={setFilter} />

          {sorted.length > 0 ? (
            <div className="grid grid-cols-4 gap-5">
              {sorted.map((artwork) => (
                <WishlistCard
                  key={artwork.id}
                  artwork={artwork}
                  onClick={() => setSelectedArtwork(artwork)}
                />
              ))}
            </div>
          ) : (
            <div className="flex flex-col items-center justify-center py-32">
              <p className="text-[15px] font-medium text-[#888780]">
                저장한 작품이 없습니다.
              </p>
            </div>
          )}
        </div>
      </main>

      {selectedArtwork && (
        <ArtworkModal
          key={selectedArtwork.id}
          artwork={selectedArtwork}
          onClose={() => setSelectedArtwork(null)}
          onLikeChange={(liked) => {
            if (!liked) {
              setArtworks((prev) =>
                prev.filter((a) => a.id !== selectedArtwork.id)
              );
              setSelectedArtwork(null);
            }
          }}
        />
      )}
    </>
  );
}
