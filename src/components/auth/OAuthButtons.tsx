'use client';

import { createClient } from '@/lib/supabase/client';
import { useState } from 'react';
import { FcGoogle } from 'react-icons/fc';
import { RiKakaoTalkFill } from 'react-icons/ri';

type Provider = 'google' | 'kakao';

type OAuthButtonsProps = {
  /** 상단 "또는" 구분선 표시 여부. 폼 아래에 붙을 때는 true, 단독 배치 시 false. */
  showDivider?: boolean;
};

const OAuthButtons = ({ showDivider = true }: OAuthButtonsProps) => {
  const supabase = createClient();
  const [loadingProvider, setLoadingProvider] = useState<Provider | null>(null);

  const handleOAuth = async (provider: Provider) => {
    if (loadingProvider) return;
    setLoadingProvider(provider);

    const redirectTo = `${window.location.origin}/api/auth/callback`;

    const { error } = await supabase.auth.signInWithOAuth({
      provider,
      options: { redirectTo },
    });

    // 정상 흐름이면 provider 페이지로 리다이렉트되어 이 줄에 도달하지 않음.
    if (error) setLoadingProvider(null);
  };

  return (
    <div className="flex flex-col gap-3">
      {/* "또는" 구분선 */}
      {showDivider && (
        <div className="my-2 flex items-center gap-3">
          <div className="border-secondary/10 flex-1 border-t" />
          <span className="text-secondary/40 text-[13px]">또는</span>
          <div className="border-secondary/10 flex-1 border-t" />
        </div>
      )}

      {/* Google */}
      <button
        type="button"
        onClick={() => handleOAuth('google')}
        disabled={loadingProvider !== null}
        className="border-secondary/10 text-secondary flex h-13 w-full items-center justify-center gap-3 rounded-[14px] border bg-white text-[16px] font-medium transition-all hover:bg-[#faf7f2] active:scale-[0.99] disabled:opacity-60"
      >
        <FcGoogle className="h-5 w-5" />
        {loadingProvider === 'google' ? '이동 중...' : 'Google로 계속하기'}
      </button>

      {/* Kakao */}
      <button
        type="button"
        onClick={() => handleOAuth('kakao')}
        disabled={loadingProvider !== null}
        className="flex h-13 w-full items-center justify-center gap-3 rounded-[14px] bg-[#fee500] text-[16px] font-medium text-[#191600] transition-all hover:bg-[#f5dd00] active:scale-[0.99] disabled:opacity-60"
      >
        <RiKakaoTalkFill className="h-5 w-5" />
        {loadingProvider === 'kakao' ? '이동 중...' : 'Kakao로 계속하기'}
      </button>
    </div>
  );
};

export default OAuthButtons;
