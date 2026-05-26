'use client';

import { useState } from 'react';
import { createClient } from '@/lib/supabase/client';

export default function LogoutButton() {
  const [isLoggingOut, setIsLoggingOut] = useState(false);

  async function handleLogout() {
    if (isLoggingOut) return;
    setIsLoggingOut(true);
    const supabase = createClient();
    const { error } = await supabase.auth.signOut();
    if (error) {
      setIsLoggingOut(false);
      return;
    }
    window.location.replace('/');
  }

  return (
    <button
      type="button"
      onClick={handleLogout}
      disabled={isLoggingOut}
      className="flex w-full items-center justify-center gap-2 rounded-[18px] border border-[#ece4d9] bg-white px-5 py-4 text-[14px] font-medium text-[#E5484D] shadow-[0_2px_8px_rgba(64,48,33,0.02)] transition-colors hover:bg-[#fcfaf7] disabled:opacity-60"
    >
      <svg width="15" height="15" viewBox="0 0 16 16" fill="none">
        <path
          d="M6 2H3a1 1 0 00-1 1v10a1 1 0 001 1h3M10 11l3-3-3-3M13 8H6"
          stroke="currentColor"
          strokeWidth="1.5"
          strokeLinecap="round"
          strokeLinejoin="round"
        />
      </svg>
      {isLoggingOut ? '로그아웃 중...' : '로그아웃'}
    </button>
  );
}
