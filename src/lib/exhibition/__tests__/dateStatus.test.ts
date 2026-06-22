import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest';
import { getStatus, todayKST } from '../dateStatus';

describe('getStatus — endedAt 우선순위', () => {
  beforeEach(() => {
    vi.useFakeTimers();
    // 기준 현재 시각: 2026-06-22 12:00 KST
    vi.setSystemTime(new Date('2026-06-22T12:00:00+09:00'));
  });
  afterEach(() => {
    vi.useRealTimers();
  });

  it('ended_at이 과거면 날짜 범위가 진행중이어도 ended', () => {
    expect(getStatus('2026-06-01', '2026-12-31', '2026-06-20T00:00:00Z')).toBe(
      'ended'
    );
  });

  it('ended_at이 null이면 기존 날짜 로직대로 ongoing', () => {
    expect(getStatus('2026-06-01', '2026-12-31', null)).toBe('ongoing');
  });

  it('ended_at 인자를 생략하면 기존 동작과 동일(ongoing)', () => {
    expect(getStatus('2026-06-01', '2026-12-31')).toBe('ongoing');
  });

  it('ended_at이 미래면 무시하고 날짜 로직대로 ongoing', () => {
    expect(getStatus('2026-06-01', '2026-12-31', '2026-12-30T00:00:00Z')).toBe(
      'ongoing'
    );
  });

  it('한국 시간 기준 오늘 날짜를 반환한다', () => {
    vi.setSystemTime(new Date('2026-06-21T15:30:00.000Z'));

    expect(todayKST()).toBe('2026-06-22');
  });

  it('시작일 00:00 KST부터 ongoing으로 본다', () => {
    vi.setSystemTime(new Date('2026-05-31T15:00:00.000Z'));

    expect(getStatus('2026-06-01', '2026-12-31')).toBe('ongoing');
  });

  it('종료일 23:59:59 KST 이후 ended로 본다', () => {
    vi.setSystemTime(new Date('2026-06-01T15:00:00.000Z'));

    expect(getStatus('2026-06-01', '2026-06-01')).toBe('ended');
  });
});
