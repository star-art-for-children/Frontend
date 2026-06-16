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
  reactions: Record<string, number>;
  myReaction: string | null;
};

export type ArtworkWithEmail = {
  id: string;
  title: string;
  artist_name: string;
  description: string | null;
  image_url: string;
  artist_email: string;
};

export type ArtworkFormUi = {
  artist_email: string | null;
  title: string;
  artist_name: string;
  description: string | null;
  image_url: string | File;
};
