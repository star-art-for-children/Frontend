import Image from 'next/image';
import Link from 'next/link';
import { createClient } from '@/lib/supabase/server';
import { UserMenu } from './userMenu';

export default async function Header() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  let name: string | undefined =
    user?.user_metadata?.username ?? user?.email?.split('@')[0];

  if (user) {
    const { data: profile } = await supabase
      .from('profiles')
      .select('username')
      .eq('id', user.id)
      .maybeSingle();

    name = profile?.username ?? name;
  }

  const displayName = name?.trim() || '사용자';

  return (
    <header className="h-16">
      <div className="border-secondary/8 fixed top-0 z-20 h-16 w-full border-b bg-[#FAF7F2]/95 shadow-[0_2px_8px_rgba(44,40,38,0.06)] backdrop-blur">
        <div className="mx-auto flex h-full max-w-6xl items-center justify-between px-3.5">
          <div className="flex items-center gap-4">
            <Link href="/" className="flex items-center gap-2">
              <Image
                src="/images/logo.svg"
                alt="스타아트 로고"
                width={32}
                height={32}
              />
              <span className="text-secondary text-lg font-bold">스타아트</span>
            </Link>

            <nav>
              <Link
                href="/"
                className="text-secondary/60 text-sm transition-colors hover:text-gray-900"
              >
                전체 전시회
              </Link>
            </nav>
          </div>

          <div className="flex items-center gap-2">
            {user ? (
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
        </div>
      </div>
    </header>
  );
}
