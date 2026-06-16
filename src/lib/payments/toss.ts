import { buildTossAuthHeader } from './auth';

const TOSS_CONFIRM_URL = 'https://api.tosspayments.com/v1/payments/confirm';
// 결제 승인 요청 타임아웃(ms). 초과 시 중단 → 호출처에서 에러 처리 후 재시도(멱등) 가능.
const CONFIRM_TIMEOUT_MS = 10_000;

export type TossConfirmResult = {
  ok: boolean;
  status: number;
  data: Record<string, unknown> & { code?: string; message?: string };
};

export const confirmTossPayment = async (input: {
  paymentKey: string;
  orderId: string;
  amount: number;
}): Promise<TossConfirmResult> => {
  const res = await fetch(TOSS_CONFIRM_URL, {
    method: 'POST',
    headers: {
      Authorization: buildTossAuthHeader(process.env.TOSS_SECRET_KEY!),
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(input),
    signal: AbortSignal.timeout(CONFIRM_TIMEOUT_MS),
  });
  const data = await res.json();
  // 이미 승인된 결제(재시도) 는 성공으로 간주
  const alreadyDone = data?.code === 'ALREADY_PROCESSED_PAYMENT';
  return { ok: res.ok || alreadyDone, status: res.status, data };
};
