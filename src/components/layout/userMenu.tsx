'use client';

import Link from 'next/link';
import { useState, useEffect } from 'react';
import { ChevronDown, ChevronUp, LogOut } from 'lucide-react';
import { USER_NAV_ITEMS } from './navItems';
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
    const mq = window.matchMedia('(max-width: 767px)');
    const handleChange = () => {
      if (mq.matches) setOpen(false);
    };
    mq.addEventListener('change', handleChange);
    return () => mq.removeEventListener('change', handleChange);
  }, []);

  const initial = name.charAt(0);

  return (
    <DropdownMenu open={open} onOpenChange={setOpen} modal={false}>
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
        {USER_NAV_ITEMS.map((item) => (
          <DropdownMenuItem
            key={item.label}
            className="text-secondary hover:bg-primary/10 focus:bg-primary/10 flex cursor-pointer items-center gap-2 rounded-xl p-3 text-sm transition-colors"
            render={<Link href={item.href} />}
          >
            <span className="text-primary">{item.icon}</span>
            {item.label}
          </DropdownMenuItem>
        ))}

        <DropdownMenuSeparator className="bg-[#F0EAD8]" />

        <DropdownMenuItem
          onClick={handleLogout}
          disabled={isLoggingOut}
          className={cn(
            'flex w-full cursor-pointer items-center gap-3 rounded-xl p-3 text-sm text-[#E5484D] transition-colors',
            'focus:text-[#E5484D] disabled:opacity-60'
          )}
        >
          <LogOut className="h-4 w-4" />
          {isLoggingOut ? '로그아웃 중...' : '로그아웃'}
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
