import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';
import { checkoutRequestSchema } from '@/lib/schemas/payment';
import { createOrder } from '@/lib/payments/order';

export async function POST(req: NextRequest) {
  try {
    const supabase = await createClient();
    const {
      data: { user },
    } = await supabase.auth.getUser();
    if (!user) {
      return NextResponse.json({ message: 'unauthorized' }, { status: 401 });
    }

    const body = await req.json();
    const parsed = checkoutRequestSchema.safeParse(body);
    if (!parsed.success) {
      return NextResponse.json(
        { message: parsed.error.issues[0]?.message ?? 'invalid amount' },
        { status: 400 }
      );
    }

    const orderId = await createOrder(user.id, parsed.data.amount);
    return NextResponse.json({ orderId, amount: parsed.data.amount }, { status: 200 });
  } catch (e) {
    console.error('checkout error:', e);
    return NextResponse.json({ message: 'checkout failed' }, { status: 500 });
  }
}
