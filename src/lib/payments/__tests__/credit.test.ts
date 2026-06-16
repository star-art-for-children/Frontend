import { describe, it, expect } from 'vitest';
import { hasSufficientCredit, CREDIT_COSTS } from '../credit';

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
