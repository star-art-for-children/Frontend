import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest';

const { updateSpy, currentRow, ownerResult } = vi.hoisted(() => ({
  updateSpy: vi.fn(() => ({ eq: () => Promise.resolve({ error: null }) })),
  currentRow: {
    value: {
      start_date: '2026-06-01',
      end_date: '2026-12-31',
      ended_at: null as string | null,
    },
  },
  ownerResult: {
    value: { ok: true } as {
      ok: boolean;
      status?: number;
      message?: string;
    },
  },
}));

vi.mock('@/lib/supabase/server', () => ({
  createClient: vi.fn(async () => ({
    from: () => ({
      select: () => ({
        eq: () => ({
          single: () =>
            Promise.resolve({ data: currentRow.value, error: null }),
        }),
      }),
      update: updateSpy,
    }),
  })),
}));

vi.mock('@/lib/gallery/checkRole', () => ({
  checkRole: vi.fn(async () => ({ ok: true, user: { id: 'u1' } })),
  checkExhibitionOwner: vi.fn(async () => ownerResult.value),
}));

import { PATCH } from '../route';

const makeReq = (body: unknown) => ({ json: async () => body }) as never;
const params = { params: Promise.resolve({ exhibitionId: 'e1' }) };

describe('PATCH /api/exhibitions/[exhibitionId]', () => {
  beforeEach(() => {
    vi.useFakeTimers();
    vi.setSystemTime(new Date('2026-06-22T12:00:00+09:00'));
    updateSpy.mockClear();
    currentRow.value = {
      start_date: '2026-06-01',
      end_date: '2026-12-31',
      ended_at: null,
    };
    ownerResult.value = { ok: true };
  });
  afterEach(() => {
    vi.useRealTimers();
  });

  it('소유자가 아니면 403', async () => {
    ownerResult.value = {
      ok: false,
      status: 403,
      message: 'permission denied',
    };
    const res = await PATCH(makeReq({ endNow: true }), params);
    expect(res.status).toBe(403);
  });

  it('endNow=true(진행중)면 ended_at을 설정하고 200', async () => {
    const res = await PATCH(makeReq({ endNow: true }), params);
    expect(res.status).toBe(200);
    expect(updateSpy).toHaveBeenCalledWith(
      expect.objectContaining({ ended_at: expect.any(String) })
    );
  });

  it('전시 시작 당일에는 endNow=true여도 400', async () => {
    currentRow.value = {
      start_date: '2026-06-22',
      end_date: '2026-12-31',
      ended_at: null,
    };

    const res = await PATCH(makeReq({ endNow: true }), params);
    expect(res.status).toBe(400);
    expect(await res.json()).toEqual({
      message: 'cannot end exhibition on its start date',
    });
    expect(updateSpy).not.toHaveBeenCalled();
  });

  it('진행중 전시에서 종료일을 과거로 바꾸면 400', async () => {
    const res = await PATCH(
      makeReq({
        title: 't',
        description: 'd',
        startDateRaw: '2026-06-01', // 시작일은 그대로
        endDateRaw: '2026-06-10', // 오늘(2026-06-22)보다 과거
      }),
      params
    );
    expect(res.status).toBe(400);
  });

  it('진행중 전시 정보 수정(유효)이면 200', async () => {
    const res = await PATCH(
      makeReq({
        title: '새 제목',
        description: '새 설명',
        startDateRaw: '2026-06-01',
        endDateRaw: '2026-12-31',
      }),
      params
    );
    expect(res.status).toBe(200);
    expect(updateSpy).toHaveBeenCalledWith(
      expect.objectContaining({ title: '새 제목', end_date: '2026-12-31' })
    );
  });
});
