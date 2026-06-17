import { createAdminClient } from '@/lib/supabase/admin';
import { createClient } from '@/lib/supabase/server';
import type { CreditType } from '@/types/payment';

// 단가 상수는 클라이언트-세이프 모듈에 두고 재노출한다(클라이언트에서도 import 가능).
export { CREDIT_COSTS } from './costs';

export const hasSufficientCredit = (balance: number, cost: number) =>
  balance >= cost;

// 원자적 잔액 변동. delta 양수=충전, 음수=차감. 반환=변동 후 잔액.
export const applyCredit = async (p: {
  userId: string;
  delta: number;
  type: CreditType;
  ref: string;
}): Promise<number> => {
  const supabase = createAdminClient();
  const { data, error } = await supabase.rpc('apply_credit', {
    p_user_id: p.userId,
    p_delta: p.delta,
    p_type: p.type,
    p_ref: p.ref,
  });
  if (error) {
    if (error.message.includes('INSUFFICIENT_CREDIT')) {
      throw new Error('INSUFFICIENT_CREDIT');
    }
    throw error;
  }
  return data as number;
};

export const getBalance = async (userId: string): Promise<number> => {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from('credit_wallets')
    .select('balance')
    .eq('user_id', userId)
    .maybeSingle();
  if (error) throw error;
  // 행 없음(지갑 미생성)만 0으로 처리
  return data?.balance ?? 0;
};

// 잔액 부족 — 라우트에서 402로 매핑하기 위한 전용 에러.
export class InsufficientCreditError extends Error {
  constructor(
    public balance: number,
    public cost: number
  ) {
    super('INSUFFICIENT_CREDIT');
  }
}

// 선차감 → run 실행 → 실패 시 자동 환불.
// ref는 시도마다 고유(randomUUID)여야 한다. 고정값(artworkId 등) 금지.
export const withCreditSpend = async <T>(p: {
  userId: string;
  cost: number;
  ref: string;
  run: () => Promise<T>;
}): Promise<T> => {
  const balance = await getBalance(p.userId);
  if (!hasSufficientCredit(balance, p.cost)) {
    throw new InsufficientCreditError(balance, p.cost);
  }

  // 선차감. 동시 요청으로 사전검사 통과 후 잔액이 비면 apply_credit가
  // 일반 Error('INSUFFICIENT_CREDIT')를 던지므로, 402용 에러로 변환한다.
  try {
    await applyCredit({
      userId: p.userId,
      delta: -p.cost,
      type: 'spend',
      ref: p.ref,
    });
  } catch (e) {
    if (e instanceof Error && e.message === 'INSUFFICIENT_CREDIT') {
      throw new InsufficientCreditError(balance, p.cost);
    }
    throw e;
  }

  try {
    return await p.run();
  } catch (e) {
    // 환불 실패가 원본 에러를 덮어쓰지 않게 한다. 환불이 실패하면 사용자는
    // 차감만 된 상태이므로 반드시 로그로 남겨 수동 보정/알림이 가능하게 한다.
    try {
      await applyCredit({
        userId: p.userId,
        delta: +p.cost,
        type: 'refund',
        ref: `${p.ref}:refund`,
      });
    } catch (refundErr) {
      console.error('credit refund failed', {
        userId: p.userId,
        ref: p.ref,
        cost: p.cost,
        refundErr,
      });
    }
    throw e; // 항상 원본 에러를 전파
  }
};
