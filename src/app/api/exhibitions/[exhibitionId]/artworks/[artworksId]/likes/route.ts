import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';
import { getAuthContext } from '@/lib/auth/getAuthContext';

export async function POST(
  req: NextRequest,
  { params }: { params: Promise<{ artworksId: string }> }
) {
  try {
    const supabase = await createClient();
    const { artworksId } = await params;

    // 미온보딩은 비로그인 취급
    const { user, onboarded } = await getAuthContext();

    if (!user || !onboarded) {
      return Response.json({ message: 'no session' }, { status: 401 });
    }

    const { data: existing, error: exError } = await supabase
      .from('artwork_likes')
      .select('id')
      .eq('user_id', user.id)
      .eq('artwork_id', artworksId)
      .maybeSingle();

    if (exError) {
      console.log(exError);
      return Response.json(
        { message: 'artwork_likes_search_ error' },
        { status: 500 }
      );
    }
    if (existing) {
      await supabase.from('artwork_likes').delete().eq('id', existing.id);

      return Response.json({ liked: false });
    }

    console.log(user.id, artworksId);
    const { error } = await supabase.from('artwork_likes').insert({
      artwork_id: artworksId,
      user_id: user.id,
    });
    if (error) {
      console.log(error);
      return Response.json(
        { message: 'failed to insert like' },
        { status: 500 }
      );
    }

    return Response.json({ liked: true });
  } catch (err) {
    console.log(err);
    return Response.json({ message: 'server error' }, { status: 500 });
  }
}

export async function DELETE(
  _req: NextRequest,
  { params }: { params: Promise<{ artworksId: string }> }
) {
  try {
    const supabase = await createClient();

    // user 정보 (미온보딩은 비로그인 취급)
    const { user, onboarded } = await getAuthContext();

    if (!user || !onboarded) {
      return NextResponse.json(
        { message: '로그인이 필요한 기능입니다.' },
        { status: 401 }
      );
    }

    const { artworksId } = await params;

    const { error } = await supabase
      .from('artwork_likes')
      .delete()
      .eq('artwork_id', artworksId)
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
