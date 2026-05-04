'use client';

export const dynamic = 'force-dynamic';

import { useRef, useState } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { Mail, Lock, Eye, EyeOff } from 'lucide-react';
import { createClient } from '@/lib/supabase/client';
import { getAuthErrorMessage } from '@/lib/supabase/authErrors';

export default function LoginPage() {
  const router = useRouter();
  const supabase = createClient();

  const [showPassword, setShowPassword] = useState(false);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const submissionLockRef = useRef(false);

  const handleLogin = async () => {
    if (submissionLockRef.current) return;

    setErrorMessage(null);

    if (!email || !password) {
      setErrorMessage('이메일과 비밀번호를 입력해주세요.');
      return;
    }

    submissionLockRef.current = true;
    setIsSubmitting(true);
    const { error } = await supabase.auth.signInWithPassword({
      email,
      password,
    });

    if (error) {
      submissionLockRef.current = false;
      setIsSubmitting(false);
      setErrorMessage(getAuthErrorMessage(error));
      return;
    }

    router.replace('/');
    router.refresh();
  };

  return (
    <main className="flex min-h-screen flex-1 items-center justify-center bg-[#faf7f2] px-4 py-12">
      <div className="flex w-full max-w-4xl items-center gap-8">
        {/* 왼쪽: 갤러리 이미지 카드 — 모바일에서 숨김 */}
        <div className="relative hidden aspect-square w-full max-w-108 shrink-0 overflow-hidden rounded-3xl shadow-[0px_25px_50px_-12px_rgba(0,0,0,0.25)] lg:block">
          <Image
            src="/images/login-gallery.jpg"
            alt="스타아트 갤러리"
            fill
            sizes="432px"
            className="object-cover"
            priority
          />
          {/* 그라디언트 오버레이 */}
          <div className="absolute inset-0 bg-linear-to-t from-[rgba(44,40,38,0.6)] to-transparent" />
          {/* 하단 브랜딩 */}
          <div className="absolute bottom-8 left-8 flex flex-col gap-3">
            <div className="flex items-center gap-2">
              <div className="flex size-8 items-center justify-center rounded-full bg-[#f4b942]">
                <Image
                  src="/images/logo.svg"
                  alt="스타아트 로고"
                  width={16}
                  height={16}
                />
              </div>
              <span className="text-[18px] font-bold text-white">스타아트</span>
            </div>
            <p className="text-[14px] leading-relaxed text-white/80">
              아이들의 창작물을 진지한 예술로,
              <br />
              온라인 3D 가상 전시회 플랫폼
            </p>
          </div>
        </div>

        {/* 오른쪽: 로그인 폼 카드 */}
        <div className="mx-auto w-full max-w-lg min-w-0 flex-1 rounded-3xl border border-[rgba(44,40,38,0.05)] bg-white p-8 shadow-[0px_20px_25px_0px_rgba(0,0,0,0.1),0px_8px_10px_0px_rgba(0,0,0,0.1)]">
          {/* 타이틀 */}
          <div className="mb-8 flex flex-col gap-1">
            <h1 className="text-secondary text-[28px] leading-tight font-bold">
              로그인
            </h1>
            <p className="text-secondary/50 text-[14px]">
              전시회를 감상하고 좋아요, 리뷰를 남겨보세요
            </p>
          </div>

          {/* 폼 */}
          <form
            className="flex flex-col gap-4"
            onSubmit={(e) => {
              e.preventDefault();
              handleLogin();
            }}
          >
            {/* 이메일 */}
            <div className="flex flex-col gap-2">
              <label className="text-secondary text-[14px] font-medium">
                이메일
              </label>
              <div className="relative">
                <div className="text-secondary/40 absolute top-1/2 left-3.5 -translate-y-1/2">
                  <Mail className="h-4 w-4" />
                </div>
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="example@email.com"
                  className="border-secondary/5 text-secondary placeholder:text-secondary/30 focus:border-primary/40 focus:ring-primary/30 h-12.5 w-full rounded-[14px] border bg-[#faf7f2] pr-4 pl-10 text-[16px] transition-all outline-none focus:ring-2"
                />
              </div>
            </div>

            {/* 비밀번호 */}
            <div className="flex flex-col gap-2">
              <label className="text-secondary text-[14px] font-medium">
                비밀번호
              </label>
              <div className="relative">
                <div className="text-secondary/40 absolute top-1/2 left-3.5 -translate-y-1/2">
                  <Lock className="h-4 w-4" />
                </div>
                <input
                  type={showPassword ? 'text' : 'password'}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="비밀번호를 입력하세요"
                  className="border-secondary/5 text-secondary placeholder:text-secondary/30 focus:border-primary/40 focus:ring-primary/30 h-12.5 w-full rounded-[14px] border bg-[#faf7f2] pr-12 pl-10 text-[16px] transition-all outline-none focus:ring-2"
                />
                <button
                  type="button"
                  tabIndex={-1}
                  onClick={() => setShowPassword(!showPassword)}
                  className="text-secondary/40 hover:text-secondary/70 absolute top-1/2 right-3.5 -translate-y-1/2 transition-colors"
                >
                  {showPassword ? (
                    <EyeOff className="h-4 w-4" />
                  ) : (
                    <Eye className="h-4 w-4" />
                  )}
                </button>
              </div>
            </div>

            {/* 에러 메시지 */}
            {errorMessage && (
              <p className="text-[14px] text-red-500">{errorMessage}</p>
            )}

            {/* 로그인 버튼 */}
            <button
              type="submit"
              disabled={isSubmitting}
              className="bg-primary mt-2 h-13 w-full rounded-[14px] text-[16px] font-semibold text-white shadow-[0px_1px_3px_0px_rgba(0,0,0,0.1),0px_1px_2px_0px_rgba(0,0,0,0.1)] transition-all hover:bg-[#e5aa35] active:scale-[0.99] disabled:opacity-60"
            >
              {isSubmitting ? '로그인 중...' : '로그인'}
            </button>
          </form>

          {/* 회원가입 링크 */}
          <p className="text-secondary/50 mt-6 text-center text-[14px]">
            아직 계정이 없으신가요?{' '}
            <Link
              href="/signup"
              className="text-primary font-medium hover:underline"
            >
              회원가입 하기
            </Link>
          </p>
        </div>
      </div>
    </main>
  );
}
