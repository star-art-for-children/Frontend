import type { OrderStatus } from '@/types/payment';

export type ConfirmCheck =
  | { status: 'ok' }
  | { status: 'already_done' }
  | { status: 'reject'; reason: string };

export const verifyConfirm = (params: {
  storedStatus: OrderStatus | null;
  storedAmount: number | null;
  queryAmount: number;
}): ConfirmCheck => {
  const { storedStatus, storedAmount, queryAmount } = params;
  if (storedStatus === null || storedAmount === null) {
    return { status: 'reject', reason: 'ORDER_NOT_FOUND' };
  }
  if (storedStatus === 'DONE') return { status: 'already_done' };
  if (storedStatus !== 'READY') {
    return { status: 'reject', reason: 'INVALID_ORDER_STATUS' };
  }
  if (storedAmount !== queryAmount) {
    return { status: 'reject', reason: 'AMOUNT_MISMATCH' };
  }
  return { status: 'ok' };
};
