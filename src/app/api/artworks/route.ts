import { NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';
import type { Artwork } from '@/components/myArtworks/Types';

type RawArtwork = {
  id: string;
  title: string;
  artist_name: string | null;
  description: string | null;
  image_url: string | null;
  created_at: string;
  artwork_likes: { count: number }[] | null;
  exhibitions: {
    id: string;
    title: string;
    profiles: { institution: string | null } | null;
  } | null;
};

export async function GET() {
  try {
    const supabase = await createClient();
    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) {
      return NextResponse.json({ message: 'no session' }, { status: 401 });
    }

    const { data, error } = await supabase
      .from('artworks')
      .select(
        `id, title, artist_name, description, image_url, created_at,
        artwork_likes(count),
        exhibitions ( id, title, profiles!teacher_id ( institution ) )`
      )
      .eq('artist_id', user.id)
      .order('created_at', { ascending: false });

    if (error) {
      console.log(error);
      return NextResponse.json({ message: error.message }, { status: 500 });
    }

    const artworkIds = (data ?? []).map((a) => a.id);

    const { data: likedData, error: likedError } =
      artworkIds.length > 0
        ? await supabase
            .from('artwork_likes')
            .select('artwork_id')
            .eq('user_id', user.id)
            .in('artwork_id', artworkIds)
        : { data: [], error: null };

    if (likedError) {
      console.log(likedError);
      return NextResponse.json(
        { message: likedError.message },
        { status: 500 }
      );
    }

    const likedSet = new Set((likedData ?? []).map((l) => l.artwork_id));

    const artworks: Artwork[] = ((data ?? []) as unknown as RawArtwork[]).map(
      (raw) => ({
        id: raw.id,
        exhibitionId: raw.exhibitions?.id ?? '',
        title: raw.title,
        artist: raw.artist_name ?? '',
        description: raw.description ?? '',
        exhibitionTitle: raw.exhibitions?.title ?? '',
        academyName: raw.exhibitions?.profiles?.institution ?? '',
        imageUrl: raw.image_url ?? '',
        likesCount: (raw.artwork_likes ?? [])[0]?.count ?? 0,
        isLiked: likedSet.has(raw.id),
        createdAt: raw.created_at,
      })
    );

    return NextResponse.json({ artworks }, { status: 200 });
  } catch (e) {
    console.log(e);
    return NextResponse.json({ message: 'unknown error' }, { status: 500 });
  }
}
