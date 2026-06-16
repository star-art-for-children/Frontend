import { randomUUID } from 'node:crypto';
import { createAdminClient } from '@/lib/supabase/admin';
import type { OrderStatus } from '@/types/payment';

export const generateOrderId = () =>
  `charge_${Date.now()}_${randomUUID().slice(0, 8)}`;

export const createOrder = async (userId: string, amount: number) => {
  const supabase = createAdminClient();
  const orderId = generateOrderId();
  const { error } = await supabase
    .from('payment_orders')
    .insert({ user_id: userId, order_id: orderId, amount, status: 'READY' });
  if (error) throw error;
  return orderId;
};

export const getOrder = async (orderId: string) => {
  const supabase = createAdminClient();
  const { data } = await supabase
    .from('payment_orders')
    .select('user_id, amount, status')
    .eq('order_id', orderId)
    .maybeSingle();
  return data as {
    user_id: string;
    amount: number;
    status: OrderStatus;
  } | null;
};

export const markOrderDone = async (
  orderId: string,
  paymentKey: string,
  raw: Record<string, unknown>
) => {
  const supabase = createAdminClient();
  await supabase
    .from('payment_orders')
    .update({
      status: 'DONE',
      payment_key: paymentKey,
      raw_response: raw,
      approved_at: new Date().toISOString(),
    })
    .eq('order_id', orderId);
};

export const markOrderFailed = async (orderId: string) => {
  const supabase = createAdminClient();
  await supabase
    .from('payment_orders')
    .update({ status: 'FAILED' })
    .eq('order_id', orderId);
};
