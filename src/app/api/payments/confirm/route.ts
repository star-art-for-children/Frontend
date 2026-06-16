import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';
import { getOrder, markOrderDone, markOrderFailed } from '@/lib/payments/order';
import { verifyConfirm } from '@/lib/payments/verify';
import { confirmTossPayment } from '@/lib/payments/toss';
import { applyCredit, getBalance } from '@/lib/payments/credit';

export async function POST(req: NextRequest) {
  try {
    const supabase = await createClient();
    const {
      data: { user },
    } = await supabase.auth.getUser();
    if (!user) {
      return NextResponse.json({ message: 'unauthorized' }, { status: 401 });
    }

    const { paymentKey, orderId, amount } = await req.json();
    const queryAmount = Number(amount);

    const order = await getOrder(orderId);
    const check = verifyConfirm({
      storedStatus: order?.status ?? null,
      storedAmount: order?.amount ?? null,
      queryAmount,
    });

    if (check.status === 'already_done') {
      return NextResponse.json(
        { balance: await getBalance(user.id), alreadyProcessed: true },
        { status: 200 }
      );
    }
    if (check.status === 'reject') {
      return NextResponse.json({ message: check.reason }, { status: 400 });
    }
    if (order!.user_id !== user.id) {
      return NextResponse.json({ message: 'forbidden' }, { status: 403 });
    }

    const toss = await confirmTossPayment({
      paymentKey,
      orderId,
      amount: queryAmount,
    });
    if (!toss.ok) {
      await markOrderFailed(orderId);
      return NextResponse.json(
        {
          message: toss.data.message ?? 'confirm failed',
          code: toss.data.code,
        },
        { status: 400 }
      );
    }

    // ref=orderId 로 멱등 적립 → markOrderDone 실패해도 재시도 안전
    const balance = await applyCredit({
      userId: user.id,
      delta: order!.amount,
      type: 'charge',
      ref: orderId,
    });
    await markOrderDone(orderId, paymentKey, toss.data);

    return NextResponse.json({ balance }, { status: 200 });
  } catch (e) {
    console.error('confirm error:', e);
    return NextResponse.json({ message: 'confirm failed' }, { status: 500 });
  }
}
