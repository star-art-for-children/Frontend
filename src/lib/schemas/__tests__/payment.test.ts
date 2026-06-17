import { describe, it, expect } from 'vitest';
import { chargeAmountSchema } from '../payment';

describe('chargeAmountSchema', () => {
  it('accepts 10000', () => {
    expect(chargeAmountSchema.safeParse(10000).success).toBe(true);
  });
  it('rejects non-1000 unit', () => {
    expect(chargeAmountSchema.safeParse(10500).success).toBe(false);
  });
  it('rejects below min', () => {
    expect(chargeAmountSchema.safeParse(500).success).toBe(false);
  });
  it('rejects above max', () => {
    expect(chargeAmountSchema.safeParse(2_000_000).success).toBe(false);
  });
  it('rejects non-integer', () => {
    expect(chargeAmountSchema.safeParse(1000.5).success).toBe(false);
  });
});
