import { createAdminClient } from '@/lib/supabase/admin';
import { createClient } from '@/lib/supabase/server';
import type { CreditType } from '@/types/payment';

// 차감 단가(크레딧=원). 조정 시 이 상수만 변경.
export const CREDIT_COSTS = {
  animate: 1000,
  theme: 500,
} as const;

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
