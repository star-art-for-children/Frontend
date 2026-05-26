import Image from 'next/image';
import Link from 'next/link';
import FormField from '@/components/auth/LoginFormField';

export default function LoginPage() {
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

          {/* 로그인 입력 폼 */}
          <FormField />

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
