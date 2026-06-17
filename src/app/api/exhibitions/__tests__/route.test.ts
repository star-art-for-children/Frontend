import { describe, it, expect, vi, beforeEach } from 'vitest';

// vi.mock 팩토리는 호이스팅되므로 스파이도 vi.hoisted로 끌어올린다.
const { validateExhibition, withCreditSpend } = vi.hoisted(() => ({
  validateExhibition: vi.fn(),
  withCreditSpend: vi.fn(),
}));

vi.mock('@/lib/supabase/server', () => ({
  createClient: vi.fn(async () => ({
    from: () => ({
      insert: () => ({
        select: () => Promise.resolve({ data: [{ id: 'e1' }], error: null }),
      }),
    }),
  })),
}));

vi.mock('@/lib/gallery/checkRole', () => ({
  checkRole: vi.fn(async () => ({ ok: true, user: { id: 'u1' } })),
}));

// 모듈 레벨 import만 충족하면 되는 의존성(POST에서 미사용)
vi.mock('@/lib/exhibition/server', () => ({
  ExhibitionsAuthRequiredError: class extends Error {},
  fetchExhibitions: vi.fn(),
}));

vi.mock('@/lib/gallery/parseForm', () => ({
  parseFormDataToObj: vi.fn(() => ({})),
}));

vi.mock('@/lib/gallery/validateExhibitionForm', () => ({ validateExhibition }));

vi.mock('@/lib/supabase/uploadImage', () => ({
  ImageUploadValidationError: class extends Error {},
  uploadImgToSupabase: vi.fn(async () => 'thumb://url'),
}));

vi.mock('@/lib/gallery/server', () => ({
  generatePresetFromImageFile: vi.fn(),
}));

vi.mock('@/lib/gallery/presets', () => ({
  defaultPreset: { id: 'default' },
  ALL_PRESETS: [],
}));

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
import { InsufficientCreditError } from '@/lib/payments/credit';

const fakeReq = { formData: async () => ({}) } as never;

describe('POST /api/exhibitions — 크레딧 부족 회귀', () => {
  beforeEach(() => {
    validateExhibition.mockReset();
    withCreditSpend.mockReset();
  });

  it('AI 테마 생성 중 잔액 부족 → 402 (defaultPreset로 조용히 생성되지 않음)', async () => {
    const thumb = new File(['x'], 'a.png', { type: 'image/png' });
    validateExhibition.mockReturnValue({
      data: {
        title: 't',
        description: 'd',
        thumbnailImg: thumb,
        start_date: '2026-01-01',
        end_date: null,
        guidelines: null,
        gallery_preset: undefined, // userPreset 없음 → AI 생성 분기
      },
    });
    withCreditSpend.mockRejectedValue(new InsufficientCreditError(100, 500));

    const res = await POST(fakeReq);

    expect(res.status).toBe(402);
    await expect(res.json()).resolves.toMatchObject({
      balance: 100,
      cost: 500,
    });
  });
});
