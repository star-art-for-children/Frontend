import { describe, it, expect } from 'vitest';
import { verifyConfirm } from '../verify';

describe('verifyConfirm', () => {
  it('ok when READY and amount matches', () => {
    expect(
      verifyConfirm({
        storedStatus: 'READY',
        storedAmount: 10000,
        queryAmount: 10000,
      })
    ).toEqual({ status: 'ok' });
  });
  it('already_done when DONE', () => {
    expect(
      verifyConfirm({
        storedStatus: 'DONE',
        storedAmount: 10000,
        queryAmount: 10000,
      })
    ).toEqual({ status: 'already_done' });
  });
  it('reject AMOUNT_MISMATCH', () => {
    expect(
      verifyConfirm({
        storedStatus: 'READY',
        storedAmount: 10000,
        queryAmount: 9999,
      })
    ).toEqual({ status: 'reject', reason: 'AMOUNT_MISMATCH' });
  });
  it('reject ORDER_NOT_FOUND when null', () => {
    expect(
      verifyConfirm({
        storedStatus: null,
        storedAmount: null,
        queryAmount: 10000,
      })
    ).toEqual({ status: 'reject', reason: 'ORDER_NOT_FOUND' });
  });
});
