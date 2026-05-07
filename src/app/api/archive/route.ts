import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';

const ARTWORK_SELECT = `
  id, title, artist_name, description, image_url, created_at,
  artwork_likes(count),
  exhibitions ( title, profiles!teacher_id ( institution ) )
`;

export async function GET(req: NextRequest) {
  try {
    const supabase = await createClient();
    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) {
      return NextResponse.json({ message: 'no session' }, { status: 401 });
    }

    const type = req.nextUrl.searchParams.get('type');

    if (type === 'mine') {
      const { data, error } = await supabase
        .from('artworks')
        .select(ARTWORK_SELECT)
        .eq('artist_id', user.id)
        .order('created_at', { ascending: false });

      if (error) {
        return NextResponse.json({ message: error.message }, { status: 500 });
      }

      return NextResponse.json({ artworks: data });
    }

    if (type === 'wishlist') {
      const { data, error } = await supabase
        .from('artwork_likes')
        .select(
          `created_at,
          artworks ( ${ARTWORK_SELECT} )`
        )
        .eq('user_id', user.id)
        .order('created_at', { ascending: false });

      if (error) {
        return NextResponse.json({ message: error.message }, { status: 500 });
      }

      return NextResponse.json({ artworks: data });
    }

    return NextResponse.json({ message: 'invalid type' }, { status: 400 });
  } catch (e) {
    console.log(e);
    return NextResponse.json({ message: 'unknown error' }, { status: 500 });
  }
}
