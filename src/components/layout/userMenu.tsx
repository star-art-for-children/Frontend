'use client';

import Link from 'next/link';
import { useState, useEffect } from 'react';
import {
  ChevronDown,
  ChevronUp,
  User,
  BookMarked,
  Heart,
  LogOut,
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { useLogout } from '@/hooks/useLogout';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';

export interface UserMenuProps {
  name: string;
}

export default function UserMenu({ name }: UserMenuProps) {
  const [open, setOpen] = useState(false);
  const { handleLogout, isLoggingOut } = useLogout();

  // resize시 메뉴 hidden
  useEffect(() => {
    const handleResize = () => {
      if (window.innerWidth < 768) setOpen(false);
    };
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  const initial = name.charAt(0);

  return (
    <DropdownMenu open={open} onOpenChange={setOpen}>
      <DropdownMenuTrigger className="hover:bg-primary/10 flex items-center gap-2 rounded-xl px-3 py-2 transition-colors outline-none">
        <span className="bg-primary flex h-8 w-8 items-center justify-center rounded-full text-sm font-semibold text-white">
          {initial}
        </span>
        <span className="text-secondary text-sm font-medium">{name}</span>
        {open ? (
          <ChevronUp className="text-secondary h-4 w-4" />
        ) : (
          <ChevronDown className="text-secondary h-4 w-4" />
        )}
      </DropdownMenuTrigger>

      <DropdownMenuContent
        align="end"
        className="w-52 overflow-hidden rounded-xl border border-[#E8DFC8] bg-white p-2 shadow-lg"
      >
        <MenuItem href="/myPage" icon={<User className="h-4 w-4" />}>
          마이페이지
        </MenuItem>
        <MenuItem href="/wishList" icon={<BookMarked className="h-4 w-4" />}>
          위시리스트
        </MenuItem>
        <MenuItem href="/artworks" icon={<Heart className="h-4 w-4" />}>
          내 작품 모아보기
        </MenuItem>

        <DropdownMenuSeparator className="bg-[#F0EAD8]" />

        <DropdownMenuItem
          onClick={handleLogout}
          disabled={isLoggingOut}
          className={cn(
            'flex w-full cursor-pointer items-center gap-3 rounded-xl p-3 text-sm text-[#E5484D] transition-colors',
            'focus:bg-[#FDECEC] focus:text-[#E5484D] disabled:opacity-60'
          )}
        >
          <LogOut className="h-4 w-4" />
          {isLoggingOut ? '로그아웃 중...' : '로그아웃'}
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
const MenuItem = ({
  href,
  icon,
  children,
}: {
  href: string;
  icon: React.ReactNode;
  children: React.ReactNode;
}) => (
  <DropdownMenuItem
    className="text-secondary hover:bg-primary/10 focus:bg-primary/10 flex cursor-pointer items-center gap-2 rounded-xl p-3 text-sm transition-colors"
    render={<Link href={href} />}
  >
    <span className="text-primary">{icon}</span>
    {children}
  </DropdownMenuItem>
);
