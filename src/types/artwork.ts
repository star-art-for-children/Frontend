export type FilterType = 'latest' | 'oldest' | 'popular';

export type Artwork = {
  id: string;
  exhibitionId: string;
  title: string;
  artist: string;
  description: string;
  exhibitionTitle: string;
  academyName: string;
  imageUrl: string;
  likesCount: number;
  isLiked: boolean;
  createdAt: string; // ISO string
};
