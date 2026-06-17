import { describe, it, expect, vi, beforeEach } from 'vitest';

// applyCredit가 쓰는 admin 클라이언트의 rpc를 제어
const rpc = vi.fn();
vi.mock('@/lib/supabase/admin', () => ({
  createAdminClient: () => ({ rpc }),
}));

// getBalance가 쓰는 server 클라이언트 체인: .from().select().eq().maybeSingle()
const maybeSingle = vi.fn();
vi.mock('@/lib/supabase/server', () => ({
  createClient: async () => ({
    from: () => ({
      select: () => ({ eq: () => ({ maybeSingle }) }),
    }),
  }),
}));

// vi.mock은 호이스팅되므로, import는 mock이 적용된 모듈을 받는다.
import {
  hasSufficientCredit,
  CREDIT_COSTS,
  withCreditSpend,
  InsufficientCreditError,
} from '../credit';

const setBalance = (balance: number) =>
  maybeSingle.mockResolvedValue({ data: { balance }, error: null });

describe('hasSufficientCredit', () => {
  it('true when balance >= cost', () => {
    expect(hasSufficientCredit(1000, 1000)).toBe(true);
  });
  it('false when balance < cost', () => {
    expect(hasSufficientCredit(999, 1000)).toBe(false);
  });
});

describe('CREDIT_COSTS', () => {
  it('has animate and theme costs', () => {
    expect(CREDIT_COSTS.animate).toBeGreaterThan(0);
    expect(CREDIT_COSTS.theme).toBeGreaterThan(0);
  });
});

describe('withCreditSpend', () => {
  beforeEach(() => {
    rpc.mockReset();
    maybeSingle.mockReset();
  });

  // ✅ 템플릿
  it('잔액 충분 → 차감 후 run 결과 반환, spend 1건', async () => {
    setBalance(2000);
    rpc.mockResolvedValue({ data: 1000, error: null }); // 차감 후 잔액

    const run = vi.fn().mockResolvedValue('ok');
    const result = await withCreditSpend({
      userId: 'u1',
      cost: CREDIT_COSTS.theme,
      ref: 'r1',
      run,
    });

    expect(result).toBe('ok');
    expect(run).toHaveBeenCalledOnce();
    // spend 1건만, refund 없음
    expect(rpc).toHaveBeenCalledTimes(1);
    expect(rpc).toHaveBeenCalledWith(
      'apply_credit',
      expect.objectContaining({
        p_delta: -CREDIT_COSTS.theme,
        p_type: 'spend',
        p_ref: 'r1',
      })
    );
  });

  it('잔액 부족(사전 검사) → InsufficientCreditError, 차감 없음', async () => {
    setBalance(100);

    const run = vi.fn();
    const promise = withCreditSpend({
      userId: 'u1',
      cost: CREDIT_COSTS.theme,
      ref: 'r1',
      run,
    });

    await expect(promise).rejects.toBeInstanceOf(InsufficientCreditError);
    await expect(promise).rejects.toMatchObject({
      balance: 100,
      cost: CREDIT_COSTS.theme,
    });
    // 차감도, run도 일어나지 않음
    expect(rpc).not.toHaveBeenCalled();
    expect(run).not.toHaveBeenCalled();
  });

  it('applyCredit가 Error(INSUFFICIENT_CREDIT) 던짐(동시성) → InsufficientCreditError로 변환', async () => {
    setBalance(2000); // 사전검사는 통과
    // 차감 시점에 잔액이 비어 RPC가 에러 반환 → applyCredit가 Error('INSUFFICIENT_CREDIT')
    rpc.mockResolvedValue({
      data: null,
      error: { message: 'P0001: INSUFFICIENT_CREDIT' },
    });

    const run = vi.fn();
    const promise = withCreditSpend({
      userId: 'u1',
      cost: CREDIT_COSTS.theme,
      ref: 'r1',
      run,
    });

    await expect(promise).rejects.toBeInstanceOf(InsufficientCreditError);
    expect(run).not.toHaveBeenCalled();
  });

  it('run 실패 → refund 1건 발생, 원본 에러 전파', async () => {
    setBalance(2000);
    rpc.mockResolvedValue({ data: 1000, error: null }); // spend, refund 모두 성공

    const original = new Error('fal.ai failed');
    const run = vi.fn().mockRejectedValue(original);

    const promise = withCreditSpend({
      userId: 'u1',
      cost: CREDIT_COSTS.animate,
      ref: 'r1',
      run,
    });

    await expect(promise).rejects.toBe(original); // 원본 에러 전파
    // spend 1 + refund 1
    expect(rpc).toHaveBeenCalledTimes(2);
    expect(rpc).toHaveBeenNthCalledWith(
      2,
      'apply_credit',
      expect.objectContaining({
        p_delta: +CREDIT_COSTS.animate,
        p_type: 'refund',
        p_ref: 'r1:refund',
      })
    );
  });

  it('run 실패 + refund도 실패 → 로그 남기고 원본 에러 전파', async () => {
    setBalance(2000);
    rpc
      .mockResolvedValueOnce({ data: 1000, error: null }) // spend 성공
      .mockRejectedValueOnce(new Error('refund rpc down')); // refund 실패

    const original = new Error('fal.ai failed');
    const run = vi.fn().mockRejectedValue(original);
    const errorSpy = vi.spyOn(console, 'error').mockImplementation(() => {});

    const promise = withCreditSpend({
      userId: 'u1',
      cost: CREDIT_COSTS.animate,
      ref: 'r1',
      run,
    });

    // 환불 에러가 가리지 않고 원본 에러가 전파됨
    await expect(promise).rejects.toBe(original);
    expect(errorSpy).toHaveBeenCalledWith(
      'credit refund failed',
      expect.objectContaining({ userId: 'u1', ref: 'r1' })
    );

    errorSpy.mockRestore();
  });
});
