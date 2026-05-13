import { createClient } from '@/lib/supabase/server';
import { NextRequest, NextResponse } from 'next/server';

export async function GET(
  _req: NextRequest,
  { params }: { params: Promise<{ exhibitionId: string }> }
) {
  try {
    const supabase = await createClient();

    // user 정보
    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) {
      return NextResponse.json({ isLiked: false }, { status: 200 });
    }

    const { exhibitionId } = await params;

    const { data, error } = await supabase
      .from('exhibition_likes')
      .select('id')
      .eq('exhibition_id', exhibitionId)
      .eq('user_id', user.id)
      .maybeSingle();

    if (error) throw error;

    return NextResponse.json({ isLiked: !!data }, { status: 200 });
  } catch (err) {
    console.error('Like GET Error:', err);
    return NextResponse.json({ message: 'unknown Error' }, { status: 500 });
  }
}

export async function POST(
  _req: NextRequest,
  { params }: { params: Promise<{ exhibitionId: string }> }
) {
  try {
    const supabase = await createClient();

    // user 정보
    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) {
      return NextResponse.json(
        { message: '로그인이 필요한 기능입니다.' },
        { status: 401 }
      );
    }

    const { exhibitionId } = await params;

    const { error } = await supabase
      .from('exhibition_likes')
      .insert({ exhibition_id: exhibitionId, user_id: user.id });

    if (error) {
      // 좋아요 중복 방지
      if (error.code === '23505') {
        return NextResponse.json(
          { message: '이미 좋아요를 눌렀습니다.' },
          { status: 409 }
        );
      }
      throw error;
    }

    return NextResponse.json(
      { message: '좋아요가 추가되었습니다.' },
      { status: 201 }
    );
  } catch (err) {
    console.error('Like POST Error:', err);
    return NextResponse.json({ message: 'unknown Error' }, { status: 500 });
  }
}

export async function DELETE(
  _req: NextRequest,
  { params }: { params: Promise<{ exhibitionId: string }> }
) {
  try {
    const supabase = await createClient();

    // user 정보
    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) {
      return NextResponse.json(
        { message: '로그인이 필요한 기능입니다.' },
        { status: 401 }
      );
    }

    const { exhibitionId } = await params;

    const { error } = await supabase
      .from('exhibition_likes')
      .delete()
      .eq('exhibition_id', exhibitionId)
      .eq('user_id', user.id);

    if (error) throw error;

    return NextResponse.json(
      { message: '좋아요가 취소되었습니다.' },
      { status: 200 }
    );
  } catch (err) {
    console.error('Like DELETE Error:', err);
    return NextResponse.json({ message: 'unknown Error' }, { status: 500 });
  }
}
