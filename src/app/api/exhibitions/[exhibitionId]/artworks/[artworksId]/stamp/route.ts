import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';

// 스탬프 투어: 그림 발견 시 스탬프 수집 (insert-only, 취소 없음)
export async function POST(
  _req: NextRequest,
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

    // 이미 수집했으면 그대로 성공 처리 (idempotent)
    const { data: existing, error: exError } = await supabase
      .from('artwork_stamps')
      .select('id')
      .eq('user_id', user.id)
      .eq('artwork_id', artworksId)
      .maybeSingle();

    if (exError) {
      console.log(exError);
      return NextResponse.json(
        { message: 'artwork_stamps search error' },
        { status: 500 }
      );
    }

    if (existing) {
      return NextResponse.json({ stamped: true });
    }

    const { error } = await supabase.from('artwork_stamps').insert({
      artwork_id: artworksId,
      exhibition_id: exhibitionId,
      user_id: user.id,
    });

    if (error) {
      console.log(error);
      return NextResponse.json(
        { message: 'failed to insert stamp' },
        { status: 500 }
      );
    }

    return NextResponse.json({ stamped: true });
  } catch (err) {
    console.log(err);
    return NextResponse.json({ message: 'server error' }, { status: 500 });
  }
}
