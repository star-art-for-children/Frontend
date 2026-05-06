export interface ExhibitionProps {
  id: string;
  title: string;
  host: string;
  image?: string;
  startDate: string;
  endDate?: string;
  likes: number;
  href?: string;
}

export type ExhibitionSort =
  | 'latest'
  | 'popular'
  | 'oldest'
  | 'upcoming'
  | 'ended'
  | 'mine';
