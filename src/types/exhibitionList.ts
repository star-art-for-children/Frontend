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
