import Image from 'next/image';
import Link from 'next/link';
import UserMenu from './UserMenu';
import MobileMenu from './MobileMenu';
import { getAuthContext } from '@/lib/auth/getAuthContext';

export default async function Header() {
  // 캐싱된 유저 데이터 조회(없다면 새로 요청)
  const { user, profile, onboarded } = await getAuthContext();

  // 진짜 로그인 = 세션 있음 + 온보딩 완료. 미온보딩은 비로그인으로 취급.
  const isAuthed = !!user && onboarded;

  const displayName = isAuthed
    ? profile?.username?.trim() ||
      user?.user_metadata?.username ||
      user?.email?.split('@')[0] ||
      '사용자'
    : null;

  return (
    <header className="h-16">
      <div className="border-secondary/8 fixed top-0 z-30 h-16 w-full border-b bg-[#FAF7F2]/95 shadow-[0_2px_8px_rgba(44,40,38,0.06)] backdrop-blur">
        <div className="mx-auto flex h-full max-w-6xl items-center justify-between px-3.5">
          <div className="flex items-center gap-4">
            <Link href="/" className="flex items-center gap-1">
              <Image
                src="/images/logo.svg"
                alt="스타아트 로고"
                width={42}
                height={42}
              />
              <span className="text-secondary text-lg font-bold">스타아트</span>
            </Link>

            <nav className="hidden md:block">
              <Link
                href="/"
                className="text-secondary/60 text-sm transition-colors hover:text-gray-900"
              >
                전체 전시회
              </Link>
            </nav>
          </div>

          <div className="hidden items-center gap-2 md:flex">
            {isAuthed ? (
              <UserMenu name={displayName} />
            ) : (
              <>
                <Link
                  href="/login"
                  className="text-secondary hover:bg-primary/10 inline-flex h-9 items-center px-5 py-1.5 text-sm hover:rounded-xl"
                >
                  로그인
                </Link>
                <Link
                  href="/signup"
                  className="bg-primary inline-flex h-9 items-center rounded-xl px-5 text-sm text-white transition-colors hover:bg-[#E09415]"
                >
                  회원가입
                </Link>
              </>
            )}
          </div>

          {/* 모바일 */}
          <div className="md:hidden">
            <MobileMenu isLoggedIn={isAuthed} />
          </div>
        </div>
      </div>
    </header>
  );
}
