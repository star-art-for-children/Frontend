import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';

type RouteContext = { params: Promise<{ reviewId: string }> };

export async function DELETE(_req: NextRequest, { params }: RouteContext) {
  try {
    const { reviewId } = await params;
    const supabase = await createClient();

    const {
      data: { user },
    } = await supabase.auth.getUser();
    if (!user) {
      return NextResponse.json({ message: 'no session' }, { status: 401 });
    }

    // 본인 리뷰인지 확인
    const { data: review, error: fetchError } = await supabase
      .from('reviews')
      .select('user_id')
      .eq('id', reviewId)
      .single();

    if (fetchError) {
      if (fetchError.code === 'PGRST116') {
        return NextResponse.json({ message: 'review not found' }, { status: 404 });
      }
      console.error(fetchError);
      return NextResponse.json({ message: 'database error' }, { status: 500 });
    }

    if (review.user_id !== user.id) {
      return NextResponse.json({ message: 'not allowed' }, { status: 403 });
    }

    const { error } = await supabase
      .from('reviews')
      .delete()
      .eq('id', reviewId);

    if (error) {
      console.error(error);
      return NextResponse.json(
        { message: 'database deletion error' },
        { status: 500 }
      );
    }

    return NextResponse.json(
      { message: 'successfully deleted' },
      { status: 200 }
    );
  } catch (e) {
    console.error(e);
    return NextResponse.json({ message: 'unknown error' }, { status: 500 });
  }
}
