import Image from 'next/image';
import { redirect } from 'next/navigation';
import { getAuthContext } from '@/lib/auth/getAuthContext';
import FormField from '@/components/auth/SignupFormField';

export default async function SignupPage() {
  // 온보딩까지 완료한 로그인 사용자만 접근 차단 (미온보딩=비로그인 정책: 다른 계정으로 재시도 가능해야 함)
  const { user, onboarded } = await getAuthContext();
  if (user && onboarded) redirect('/');

  return (
    <main className="flex flex-1 items-center justify-center bg-[#FAF7F2] px-4 pt-28 pb-12">
      <div className="w-full max-w-lg">
        {/* Logo + Title */}
        <div className="mb-8 flex flex-col items-center gap-3">
          <div className="flex items-center gap-3">
            <Image
              src="/images/logo.svg"
              alt="스타아트 로고"
              width={40}
              height={40}
            />
            <span className="text-secondary text-[20px] font-bold">
              스타아트
            </span>
          </div>
          <h1 className="text-secondary mt-2 text-[28px] font-bold">
            회원가입
          </h1>
          <p className="text-secondary/50 text-[14px]">
            계정 유형을 선택하고 가입해보세요
          </p>
        </div>

        {/* 회원가입 폼 */}
        <FormField />
      </div>
    </main>
  );
}
