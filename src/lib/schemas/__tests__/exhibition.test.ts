import { describe, it, expect } from 'vitest';
import { EditExhibitionSchema } from '../exhibition';

const valid = {
  title: '봄 전시',
  description: '설명',
  startDateRaw: '2026-06-01',
  endDateRaw: '2026-06-30',
};

describe('EditExhibitionSchema', () => {
  it('정상 입력을 통과시킨다', () => {
    expect(EditExhibitionSchema.safeParse(valid).success).toBe(true);
  });

  it('종료일을 생략해도 통과한다', () => {
    const { endDateRaw, ...rest } = valid;
    void endDateRaw;
    expect(EditExhibitionSchema.safeParse(rest).success).toBe(true);
  });

  it('빈 제목을 거부한다', () => {
    expect(
      EditExhibitionSchema.safeParse({ ...valid, title: '   ' }).success
    ).toBe(false);
  });

  it('종료일이 시작일보다 빠르면 거부한다', () => {
    expect(
      EditExhibitionSchema.safeParse({
        ...valid,
        startDateRaw: '2026-06-30',
        endDateRaw: '2026-06-01',
      }).success
    ).toBe(false);
  });
});
