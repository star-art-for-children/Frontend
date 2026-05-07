'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { Menu, X } from 'lucide-react';
import { USER_NAV_ITEMS } from './navItems';
import { useLogout } from '@/hooks/useLogout';
import { Sheet, SheetContent, SheetClose } from '@/components/ui/sheet';

interface MobileMenuProps {
  isLoggedIn: boolean;
}

export default function MobileMenu({ isLoggedIn }: MobileMenuProps) {
  const [open, setOpen] = useState(false);
  const { handleLogout, isLoggingOut } = useLogout();

  // resize시 메뉴 hidden
  useEffect(() => {
    const mq = window.matchMedia('(min-width: 768px)');
    const handleChange = () => {
      if (mq.matches) setOpen(false);
    };
    mq.addEventListener('change', handleChange);
    return () => mq.removeEventListener('change', handleChange);
  }, []);

  return (
    <Sheet open={open} onOpenChange={setOpen} modal={false}>
      <button
        type="button"
        onClick={() => setOpen((prev) => !prev)}
        className="text-secondary/60 flex h-9 w-9 items-center justify-center rounded-xl transition-colors hover:bg-black/5"
      >
        {open ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
      </button>

      <SheetContent
        side="top"
        showCloseButton={false}
        className="top-16! gap-0 border-none bg-[#FAF7F2] p-0 shadow-[0_8px_24px_rgba(44,40,38,0.10)]"
      >
        <nav className="flex flex-col px-4 pb-6">
          <NavItem href="/">전체 전시회</NavItem>

          {isLoggedIn ? (
            <>
              {USER_NAV_ITEMS.map((item) => (
                <NavItem key={item.href} href={item.href}>
                  {item.label}
                </NavItem>
              ))}
              <button
                type="button"
                onClick={handleLogout}
                disabled={isLoggingOut}
                className="pt-5 text-left text-base font-medium text-[#E5484D] disabled:opacity-60"
              >
                {isLoggingOut ? '로그아웃 중...' : '로그아웃'}
              </button>
            </>
          ) : (
            <>
              <NavItem href="/login">로그인</NavItem>
              <div className="pt-4">
                <SheetClose
                  nativeButton={false}
                  render={
                    <Link
                      href="/signup"
                      className="bg-primary flex h-12 w-full items-center justify-center rounded-xl text-base font-semibold text-white"
                    />
                  }
                >
                  회원가입
                </SheetClose>
              </div>
            </>
          )}
        </nav>
      </SheetContent>
    </Sheet>
  );
}

const NavItem = ({
  href,
  children,
}: {
  href: string;
  children: React.ReactNode;
}) => (
  <SheetClose
    nativeButton={false}
    render={
      <Link
        href={href}
        className="text-secondary border-secondary/8 border-b py-5 text-base font-medium"
      />
    }
  >
    {children}
  </SheetClose>
);
