import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';

const ARTWORK_SELECT = `
  id, title, artist_name, description, image_url, created_at,
  artwork_likes(count),
  exhibitions ( title, profiles!teacher_id ( institution ) )
`;

const DEFAULT_LIMIT = 20;

export async function GET(req: NextRequest) {
  try {
    const supabase = await createClient();
    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) {
      return NextResponse.json({ message: 'no session' }, { status: 401 });
    }

    const { searchParams } = req.nextUrl;
    const type = searchParams.get('type');
    const page = Math.max(1, Number(searchParams.get('page') ?? 1));
    const limit = Math.min(
      100,
      Math.max(1, Number(searchParams.get('limit') ?? DEFAULT_LIMIT))
    );
    const from = (page - 1) * limit;
    const to = from + limit - 1;

    if (type === 'mine') {
      const { data, error } = await supabase
        .from('artworks')
        .select(ARTWORK_SELECT)
        .eq('artist_id', user.id)
        .order('created_at', { ascending: false })
        .range(from, to);

      if (error) {
        console.error('[archive/mine]', error);
        return NextResponse.json(
          { message: 'database error' },
          { status: 500 }
        );
      }

      return NextResponse.json({ artworks: data, page, limit });
    }

    if (type === 'wishlist') {
      const { data, error } = await supabase
        .from('artwork_likes')
        .select(
          `created_at,
          artworks ( ${ARTWORK_SELECT} )`
        )
        .eq('user_id', user.id)
        .order('created_at', { ascending: false })
        .range(from, to);

      if (error) {
        console.error('[archive/wishlist]', error);
        return NextResponse.json(
          { message: 'database error' },
          { status: 500 }
        );
      }

      return NextResponse.json({ artworks: data, page, limit });
    }

    return NextResponse.json({ message: 'invalid type' }, { status: 400 });
  } catch (e) {
    console.error('[archive]', e);
    return NextResponse.json({ message: 'unknown error' }, { status: 500 });
  }
}
