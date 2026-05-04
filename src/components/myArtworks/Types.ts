export type FilterType = 'latest' | 'oldest' | 'popular';

export type Artwork = {
  id: string;
  title: string;
  artist: string;
  description: string;
  exhibitionTitle: string;
  academyName: string;
  imageUrl: string;
  likesCount: number;
  createdAt: string; // ISO string
};
