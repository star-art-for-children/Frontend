import type { Artwork, FilterType } from '@/types/artwork';

export function sortArtworks(artworks: Artwork[], filter: FilterType): Artwork[] {
  return [...artworks].sort((a, b) => {
    if (filter === 'latest')
      return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime();
    if (filter === 'oldest')
      return new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime();
    return b.likesCount - a.likesCount;
  });
}
