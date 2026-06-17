import { z } from 'zod';

export const MIN_CHARGE = 1000;
export const MAX_CHARGE = 100_000;
export const CHARGE_UNIT = 1000;

export const chargeAmountSchema = z
  .number({ error: '금액을 입력해주세요.' })
  .int('금액은 정수여야 합니다.')
  .min(MIN_CHARGE, `최소 충전 금액은 ${MIN_CHARGE.toLocaleString()}원입니다.`)
  .max(MAX_CHARGE, `최대 충전 금액은 ${MAX_CHARGE.toLocaleString()}원입니다.`)
  .refine((v) => v % CHARGE_UNIT === 0, {
    message: `${CHARGE_UNIT.toLocaleString()}원 단위로 입력해주세요.`,
  });

export const checkoutRequestSchema = z.object({ amount: chargeAmountSchema });
export type CheckoutRequest = z.infer<typeof checkoutRequestSchema>;
