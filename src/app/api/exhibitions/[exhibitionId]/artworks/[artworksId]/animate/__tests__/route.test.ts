import { describe, it, expect, vi, beforeEach } from 'vitest';

// artwork 조회(.from().select().eq().single())와 video_url 업데이트를 제어.
// vi.mock 팩토리는 호이스팅되므로 스파이도 vi.hoisted로 끌어올린다.
const { single, updateEq, withCreditSpend } = vi.hoisted(() => ({
  single: vi.fn(),
  updateEq: vi.fn(async () => ({ error: null })),
  withCreditSpend: vi.fn(),
}));
vi.mock('@/lib/supabase/server', () => ({
  createClient: vi.fn(async () => ({
    from: () => ({
      select: () => ({ eq: () => ({ single }) }),
      update: () => ({ eq: updateEq }),
    }),
  })),
}));

vi.mock('@/lib/gallery/checkRole', () => ({
  checkRole: vi.fn(async () => ({ ok: true, user: { id: 'u1' } })),
  checkExhibitionOwner: vi.fn(async () => ({ ok: true })),
}));

vi.mock('@fal-ai/client', () => ({
  fal: { config: vi.fn(), subscribe: vi.fn() },
}));

// withCreditSpend는 스파이로 — 차감 호출 여부/전달된 ref를 검증한다.
vi.mock('@/lib/payments/credit', () => {
  class InsufficientCreditError extends Error {
    constructor(
      public balance: number,
      public cost: number
    ) {
      super('INSUFFICIENT_CREDIT');
    }
  }
  return {
    CREDIT_COSTS: { animate: 1000, theme: 500 },
    InsufficientCreditError,
    withCreditSpend,
  };
});

import { POST } from '../route';
import { InsufficientCreditError, CREDIT_COSTS } from '@/lib/payments/credit';

const callPOST = (artworksId = 'a1') =>
  POST({} as never, { params: Promise.resolve({ artworksId }) } as never);

describe('POST animate route', () => {
  beforeEach(() => {
    single.mockReset();
    withCreditSpend.mockReset();
  });

  it('video_url 캐시 히트 → 200, 차감 없음', async () => {
    single.mockResolvedValue({
      data: { image_url: 'img://x', video_url: 'cached://v' },
      error: null,
    });

    const res = await callPOST();

    expect(res.status).toBe(200);
    await expect(res.json()).resolves.toEqual({ videoUrl: 'cached://v' });
    expect(withCreditSpend).not.toHaveBeenCalled();
  });

  it('잔액 부족 → 402 + balance/cost', async () => {
    single.mockResolvedValue({
      data: { image_url: 'img://x', video_url: null },
      error: null,
    });
    withCreditSpend.mockRejectedValue(new InsufficientCreditError(100, 1000));

    const res = await callPOST();

    expect(res.status).toBe(402);
    await expect(res.json()).resolves.toMatchObject({
      balance: 100,
      cost: 1000,
    });
  });

  it('시도마다 ref가 고유 — 고정(artworkId) ref 회귀 방지', async () => {
    single.mockResolvedValue({
      data: { image_url: 'img://x', video_url: null },
      error: null,
    });
    withCreditSpend.mockResolvedValue('vid://x');

    await callPOST('a1');
    await callPOST('a1'); // 같은 작품 재시도

    const ref1 = withCreditSpend.mock.calls[0][0].ref;
    const ref2 = withCreditSpend.mock.calls[1][0].ref;
    expect(ref1).not.toBe(ref2); // 매 시도 달라야 함
    expect(ref1).not.toBe('a1'); // artworkId 고정 금지
    expect(withCreditSpend.mock.calls[0][0].cost).toBe(CREDIT_COSTS.animate);
  });
});
