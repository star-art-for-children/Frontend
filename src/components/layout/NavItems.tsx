import { User, BookMarked, Heart } from 'lucide-react';

export type UserNavItem = {
  href: string;
  label: string;
  icon: React.ReactNode;
};

export const USER_NAV_ITEMS: UserNavItem[] = [
  { href: '/my-page', label: '마이페이지', icon: <User className="h-4 w-4" /> },
  {
    href: '/wish-list',
    label: '위시리스트',
    icon: <BookMarked className="h-4 w-4" />,
  },
  {
    href: '/artworks',
    label: '내 작품 모아보기',
    icon: <Heart className="h-4 w-4" />,
  },
];
