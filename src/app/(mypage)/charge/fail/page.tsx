'use client';

import { Suspense } from 'react';
import { useSearchParams } from 'next/navigation';
import Link from 'next/link';

const MESSAGES: Record<string, string> = {
  PAY_PROCESS_CANCELED: '결제를 취소했습니다.',
  PAY_PROCESS_ABORTED: '결제 중 오류가 발생했습니다.',
  REJECT_CARD_COMPANY: '카드사에서 결제를 거절했습니다.',
};

const FailContent = () => {
  const params = useSearchParams();
  const code = params.get('code') ?? '';
  const message = MESSAGES[code] ?? params.get('message') ?? '결제에 실패했습니다.';

  return (
    <main className="flex min-h-screen items-center justify-center bg-[#f8f4ee] px-5 text-[#2d2926]">
      <div className="w-full max-w-[400px] rounded-[26px] border border-[#e8e1d7] bg-white px-8 py-10 text-center shadow-[0_2px_8px_rgba(64,48,33,0.04)]">
        <h1 className="text-[20px] font-bold text-[#df6b6b]">결제 실패</h1>
        <p className="mt-1.5 text-[14px] text-[#827b73]">{message}</p>
        <Link
          href="/charge"
          className="mt-6 inline-block rounded-full border border-[#e8e1d7] px-6 py-2.5 text-[14px] font-semibold text-[#6b645c] transition-colors hover:border-[#f1c792]"
        >
          다시 시도
        </Link>
      </div>
    </main>
  );
};

const FailPage = () => (
  <Suspense>
    <FailContent />
  </Suspense>
);

export default FailPage;
