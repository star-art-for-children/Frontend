'use client';

import Link from 'next/link';
import { useEffect, useRef, useState } from 'react';
import {
  ChevronDown,
  ChevronUp,
  User,
  BookMarked,
  Heart,
  LogOut,
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { createClient } from '@/lib/supabase/client';

export interface UserMenuProps {
  name: string;
}

export function UserMenu({ name }: UserMenuProps) {
  const supabase = createClient();
  const [open, setOpen] = useState(false);
  const [isLoggingOut, setIsLoggingOut] = useState(false);
  const ref = useRef<HTMLDivElement>(null);

  const handleLogout = async () => {
    if (isLoggingOut) return;
    setIsLoggingOut(true);
    const { error } = await supabase.auth.signOut();
    if (error) {
      setIsLoggingOut(false);
      return;
    }
    window.location.replace('/');
  };

  // 외부 클릭 시 닫기
  useEffect(() => {
    if (!open) return;
    const handler = (e: MouseEvent) => {
      if (ref.current && !ref.current.contains(e.target as Node)) {
        setOpen(false);
      }
    };
    document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, [open]);

  const initial = name.charAt(0);

  return (
    <div ref={ref} className="relative">
      <button
        type="button"
        onClick={() => setOpen((prev) => !prev)}
        className="hover:bg-primary/10 flex items-center gap-2 rounded-xl px-3 py-2 transition-colors"
      >
        <span className="bg-primary flex h-8 w-8 items-center justify-center rounded-full text-sm font-semibold text-white">
          {initial}
        </span>
        <span className="text-secondary text-sm font-medium">{name}</span>
        {open ? (
          <ChevronUp className="text-secondary h-4 w-4" />
        ) : (
          <ChevronDown className="text-secondary h-4 w-4" />
        )}
      </button>

      {open && (
        <div className="absolute top-full right-0 z-10 w-52 overflow-hidden rounded-xl border border-[#E8DFC8] bg-white p-2 shadow-lg">
          <ul>
            <MenuItem href="/myPage" icon={<User className="h-4 w-4" />}>
              마이페이지
            </MenuItem>
            <MenuItem
              href="/wishList"
              icon={<BookMarked className="h-4 w-4" />}
            >
              위시리스트
            </MenuItem>
            <MenuItem href="/artworks" icon={<Heart className="h-4 w-4" />}>
              내 작품 모아보기
            </MenuItem>
          </ul>
          <span className="my-1 block border-t border-[#F0EAD8]" />
          <ul>
            <li>
              <button
                type="button"
                onClick={handleLogout}
                disabled={isLoggingOut}
                className={cn(
                  'flex w-full cursor-pointer items-center gap-3 rounded-xl p-3 text-sm text-[#E5484D] transition-colors',
                  'hover:bg-[#FDECEC] disabled:opacity-60'
                )}
              >
                <LogOut className="h-4 w-4" />
                {isLoggingOut ? '로그아웃 중...' : '로그아웃'}
              </button>
            </li>
          </ul>
        </div>
      )}
    </div>
  );
}

function MenuItem({
  href,
  icon,
  children,
}: {
  href: string;
  icon: React.ReactNode;
  children: React.ReactNode;
}) {
  return (
    <li>
      <Link
        href={href}
        className="text-secondary hover:bg-primary/10 flex items-center gap-2 rounded-xl p-3 text-sm transition-colors"
      >
        <span className="text-primary">{icon}</span>
        {children}
      </Link>
    </li>
  );
}
