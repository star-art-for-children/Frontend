import { redirect } from 'next/navigation';
import { createClient } from '@/lib/supabase/server';
import OnboardingFormField from '@/components/auth/OnboardingFormField';

function resolveDisplayName(meta: Record<string, unknown> | undefined): string {
  if (!meta) return '';
  for (const key of ['full_name', 'name', 'nickname', 'preferred_username']) {
    const value = meta[key];
    if (typeof value === 'string' && value.trim()) return value.trim();
  }
  return '';
}

export default async function OnboardingPage() {
  const supabase = await createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) redirect('/login');

  // 이미 온보딩 완료한 사용자는 홈으로 (직접 URL 접근 방어)
  const { data: profile } = await supabase
    .from('profiles')
    .select('onboarded')
    .eq('id', user.id)
    .single();

  if (profile?.onboarded) redirect('/');

  const defaultName = resolveDisplayName(user.user_metadata);

  return (
    <main className="flex min-h-screen flex-1 items-center justify-center bg-[#faf7f2] px-4 py-12">
      <div className="mx-auto w-full max-w-lg">
        <div className="mb-8 flex flex-col gap-1">
          <h1 className="text-secondary text-[28px] leading-tight font-bold">
            가입을 완료해주세요
          </h1>
          <p className="text-secondary/50 text-[14px]">
            서비스 이용을 위해 역할과 이름을 확인해주세요
          </p>
        </div>
        <OnboardingFormField defaultName={defaultName} />
      </div>
    </main>
  );
}
