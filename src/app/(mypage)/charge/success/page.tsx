'use client';

import { Suspense, useEffect, useState } from 'react';
import { useSearchParams } from 'next/navigation';
import Link from 'next/link';

const SuccessContent = () => {
  const params = useSearchParams();
  const paymentKey = params.get('paymentKey');
  const orderId = params.get('orderId');
  const amount = params.get('amount');

  const [state, setState] = useState<
    | { status: 'loading' }
    | { status: 'done'; balance: number }
    | { status: 'error'; message: string }
  >({ status: 'loading' });

  useEffect(() => {
    if (!paymentKey || !orderId || !amount) return;
    (async () => {
      try {
        const res = await fetch('/api/payments/confirm', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ paymentKey, orderId, amount: Number(amount) }),
        });
        const data = await res.json();
        if (!res.ok) {
          setState({
            status: 'error',
            message: data.message ?? '결제 승인에 실패했습니다.',
          });
          return;
        }
        setState({ status: 'done', balance: data.balance });
      } catch {
        setState({
          status: 'error',
          message: '결제 승인 중 오류가 발생했습니다. 다시 시도해주세요.',
        });
      }
    })();
  }, [paymentKey, orderId, amount]);

  // 파라미터 누락은 렌더 시점에 파생 (effect 안에서 동기 setState 금지)
  const view =
    !paymentKey || !orderId || !amount
      ? ({ status: 'error', message: '잘못된 접근입니다.' } as const)
      : state;

  return (
    <main className="flex items-center justify-center bg-[#f8f4ee] px-5 py-25 text-[#2d2926]">
      <div className="w-full max-w-[400px] rounded-[26px] border border-[#e8e1d7] bg-white px-8 py-10 text-center shadow-[0_2px_8px_rgba(64,48,33,0.04)]">
        {view.status === 'loading' && (
          <p className="text-[14px] text-[#827b73]">
            결제를 확인하는 중입니다…
          </p>
        )}
        {view.status === 'done' && (
          <>
            <div className="mx-auto mb-4 flex h-14 w-14 items-center justify-center rounded-full bg-gradient-to-br from-[#f5bf45] to-[#ff8f74]">
              <svg width="26" height="26" viewBox="0 0 24 24" fill="none">
                <path
                  d="M5 12.5l4.2 4.2L19 7"
                  stroke="white"
                  strokeWidth="2.2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                />
              </svg>
            </div>
            <h1 className="text-[20px] font-bold text-[#2b2724]">충전 완료</h1>
            <p className="mt-1.5 text-[14px] text-[#827b73]">
              현재 잔액 {view.balance.toLocaleString()} 크레딧
            </p>
            <Link
              href="/my-page"
              className="mt-6 inline-block rounded-full bg-gradient-to-r from-[#f5bf45] to-[#ff8f74] px-6 py-2.5 text-[14px] font-semibold text-white shadow-[0_2px_8px_rgba(255,143,116,0.3)] transition-opacity hover:opacity-90"
            >
              마이페이지로
            </Link>
          </>
        )}
        {view.status === 'error' && (
          <>
            <h1 className="text-[20px] font-bold text-[#df6b6b]">충전 실패</h1>
            <p className="mt-1.5 text-[14px] text-[#827b73]">{view.message}</p>
            <Link
              href="/charge"
              className="mt-6 inline-block rounded-full border border-[#e8e1d7] px-6 py-2.5 text-[14px] font-semibold text-[#6b645c] transition-colors hover:border-[#f1c792]"
            >
              다시 시도
            </Link>
          </>
        )}
      </div>
    </main>
  );
};

const SuccessPage = () => (
  <Suspense>
    <SuccessContent />
  </Suspense>
);

export default SuccessPage;
