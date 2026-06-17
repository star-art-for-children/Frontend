export type UserRole = 'teacher' | 'general';

export type ExhibitionStatus = 'active' | 'upcoming' | 'ended';

export type Exhibition = {
  id: string;
  title: string;
  artworkCount: number;
  status: ExhibitionStatus;
  thumbnail: string | null; // 이미지 URL or null
  start_date: string;
};

export type TeacherProfile = {
  id: string;
  name: string;
  email: string;
  academy_name: string;
  role: 'teacher';
  exhibitions: Exhibition[];
  selectedTitle: string | null;
};

export type UserProfile = {
  id: string;
  name: string;
  email: string;
  role: 'general';
  selectedTitle: string | null;
};

export type Profile = TeacherProfile | UserProfile;
