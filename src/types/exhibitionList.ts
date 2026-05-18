export type ExhibitionSort =
  | 'latest'
  | 'popular'
  | 'oldest'
  | 'upcoming'
  | 'ended'
  | 'mine';

export type ExhibitionRow = {
  id: string;
  title: string;
  thumbnail_url: string | null;
  start_date: string;
  end_date: string | null;
  teacher_id: string;
  created_at: string;
  profile: { institution: string } | { institution: string }[] | null;
  likes_count: number;
  status?: ExhibitionSort;
  dataText?: string;
};

export type ExhibitionListItem = {
  id: string;
  title: string;
  host: string;
  image: string | null;
  startDate: string;
  endDate: string | null;
  likes: number;
  liked: boolean;
};

export type ExhibitionDetail = {
  id: string;
  title: string;
  thumbnail_url: string | null;
  start_date: string;
  end_date: string | null;
  likes_count: number;
  status?: ExhibitionSort;
  dataText?: string;
  description?: string;
  guidelines?: string;
  profile: { institution: string } | { institution: string }[] | null;
};

export type ArtworkRow = {
  id: string;
  title: string;
  artist_name: string;
  image_url: string;
  description: string | null;
};

export type ReviewRow = {
  id: string;
  content: string;
  created_at: string;
  updated_at: string;
  user_id: string;
  profiles: { username: string | null } | { username: string | null }[] | null;
};

export type ExhibitionDetailRow = {
  id: string;
  title: string;
  thumbnail_url: string | null;
  start_date: string;
  end_date: string | null;
  description: string | null;
  guidelines: string | null;
  teacher_id: string;
  likes_count: number;
  profile: { institution: string } | { institution: string }[] | null;
  artworks: ArtworkRow[];
  reviews: ReviewRow[];
};

export type ExhibitionReviewItem = {
  id: string;
  content: string;
  author: string;
  userId: string;
  createdAt: string;
  updatedAt: string;
};

export type ReviewsPagination = {
  page: number;
  limit: number;
  totalCount: number;
  hasNextPage: boolean;
};
