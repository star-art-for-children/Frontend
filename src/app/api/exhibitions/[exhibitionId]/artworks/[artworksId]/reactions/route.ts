import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';

// 작품 이모지 반응 토글
// - 반응 없음 → 추가 / 같은 이모지 → 해제 / 다른 이모지 → 교체
const ALLOWED_EMOJIS = ['❤️', '😍', '😮', '👏'];

export async function POST(
  req: NextRequest,
  { params }: { params: Promise<{ exhibitionId: string; artworksId: string }> }
) {
  try {
    const supabase = await createClient();
    const { exhibitionId, artworksId } = await params;

    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) {
      return NextResponse.json({ message: 'no session' }, { status: 401 });
    }

    const { emoji } = await req.json();
    if (typeof emoji !== 'string' || !ALLOWED_EMOJIS.includes(emoji)) {
      return NextResponse.json({ message: 'invalid emoji' }, { status: 400 });
    }

    // 작품이 실제로 해당 전시회 소속인지 검증
    const { data: artwork, error: artworkError } = await supabase
      .from('artworks')
      .select('id')
      .eq('id', artworksId)
      .eq('exhibition_id', exhibitionId)
      .maybeSingle();

    if (artworkError) {
      console.log(artworkError);
      return NextResponse.json(
        { message: 'artwork lookup error' },
        { status: 500 }
      );
    }
    if (!artwork) {
      return NextResponse.json(
        { message: 'artwork not found in exhibition' },
        { status: 404 }
      );
    }

    // 기존 반응 조회
    const { data: existing, error: exError } = await supabase
      .from('artwork_reactions')
      .select('id, emoji')
      .eq('user_id', user.id)
      .eq('artwork_id', artworksId)
      .maybeSingle();

    if (exError) {
      console.log(exError);
      return NextResponse.json(
        { message: 'reaction search error' },
        { status: 500 }
      );
    }

    // 같은 이모지를 다시 누르면 해제
    if (existing && existing.emoji === emoji) {
      const { error } = await supabase
        .from('artwork_reactions')
        .delete()
        .eq('id', existing.id);
      if (error) {
        console.log(error);
        return NextResponse.json(
          { message: 'failed to remove reaction' },
          { status: 500 }
        );
      }
      return NextResponse.json({ emoji: null });
    }

    // 다른 이모지면 교체, 없으면 추가 (upsert)
    const { error } = await supabase.from('artwork_reactions').upsert(
      {
        artwork_id: artworksId,
        user_id: user.id,
        emoji,
      },
      { onConflict: 'user_id,artwork_id' }
    );

    if (error) {
      console.log(error);
      return NextResponse.json(
        { message: 'failed to save reaction' },
        { status: 500 }
      );
    }

    return NextResponse.json({ emoji });
  } catch (err) {
    console.log(err);
    return NextResponse.json({ message: 'server error' }, { status: 500 });
  }
}
