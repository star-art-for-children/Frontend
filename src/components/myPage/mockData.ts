import type { Profile } from '@/types/myPage';

export const teacherProfile: Profile = {
  id: 'teacher-kim',
  name: '김미술',
  email: 'kimart@example.com',
  academy_name: '해피아트 미술학원',
  role: 'teacher',
  exhibitions: [
    {
      id: 'summer-weather',
      title: '여름 날씨전',
      artworkCount: 0,
      status: 'ended',
      thumbnail: 'sunset',
    },
    {
      id: 'spring-sound',
      title: '봄의 소리전',
      artworkCount: 3,
      status: 'active',
      thumbnail: 'abstract',
    },
    {
      id: 'dreaming-kids',
      title: '꿈꾸는 아이들',
      artworkCount: 2,
      status: 'ended',
      thumbnail: 'pastel',
    },
    {
      id: 'four-seasons',
      title: '사계절 이야기',
      artworkCount: 0,
      status: 'active',
      thumbnail: 'nature',
    },
  ],
};

export const userProfile: Profile = {
  id: 'user-park',
  name: '박관람',
  email: 'park@example.com',
  role: 'user',
};
