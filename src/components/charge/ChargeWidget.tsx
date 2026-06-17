'use client';

import { useState } from 'react';
import { loadTossPayments } from '@tosspayments/tosspayments-sdk';
import { chargeAmountSchema } from '@/lib/schemas/payment';
import { AmountSelector } from './AmountSelector';

const CLIENT_KEY = process.env.NEXT_PUBLIC_TOSS_CLIENT_KEY!;

type Props = {
  customerKey: string;
};

export const ChargeWidget = ({ customerKey }: Props) => {
  const [amount, setAmount] = useState(10000);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const handlePay = async () => {
    setError(null);
    const parsed = chargeAmountSchema.safeParse(amount);
    if (!parsed.success) {
      setError(
        parsed.error.issues[0]?.message ?? '올바른 금액을 입력해주세요.'
      );
      return;
    }
    setLoading(true);
    try {
      const res = await fetch('/api/payments/checkout', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ amount }),
      });
      if (!res.ok) {
        const data = await res.json();
        setError(data.message ?? '주문 생성에 실패했습니다.');
        setLoading(false);
        return;
      }
      const { orderId } = await res.json();

      const tossPayments = await loadTossPayments(CLIENT_KEY);
      const payment = tossPayments.payment({ customerKey });
      await payment.requestPayment({
        method: 'CARD',
        amount: { currency: 'KRW', value: amount },
        orderId,
        orderName: `크레딧 ${amount.toLocaleString()}원 충전`,
        successUrl: `${window.location.origin}/charge/success`,
        failUrl: `${window.location.origin}/charge/fail`,
        card: {
          useEscrow: false,
          useCardPoint: false,
          useAppCardOnly: false,
        },
      });
    } catch (e) {
      // 구매자가 결제창을 닫으면 PAY_PROCESS_CANCELED 등으로 reject 됨
      console.error('payment request failed:', e);
      setError('결제 요청이 취소되었거나 오류가 발생했습니다.');
      setLoading(false);
    }
  };

  return (
    <div className="flex flex-col gap-6">
      <AmountSelector amount={amount} onChange={setAmount} />
      {error && <p className="text-[13px] text-[#df6b6b]">{error}</p>}
      <button
        type="button"
        onClick={handlePay}
        disabled={loading}
        className="rounded-full bg-gradient-to-r from-[#f5bf45] to-[#ff8f74] px-4 py-3.5 text-[14px] font-semibold text-white shadow-[0_2px_8px_rgba(255,143,116,0.3)] transition-opacity hover:opacity-90 disabled:opacity-50"
      >
        {loading ? '결제창 여는 중…' : `${amount.toLocaleString()}원 충전하기`}
      </button>
    </div>
  );
};
