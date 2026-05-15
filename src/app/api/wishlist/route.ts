import { NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';
import type { Artwork } from '@/components/myArtworks/Types';

type LikeRow = {
  created_at: string;
  artworks: {
    id: string;
    title: string;
    artist_name: string | null;
    description: string | null;
    image_url: string | null;
    artwork_likes: { count: number }[];
    exhibitions: {
      id: string;
      title: string;
      profiles: { institution: string | null } | null;
    } | null;
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
      .from('artwork_likes')
      .select(
        `created_at,
        artworks (
          id, title, artist_name, description, image_url,
          artwork_likes(count),
          exhibitions ( id, title, profiles!teacher_id ( institution ) )
        )`
      )
      .eq('user_id', user.id)
      .order('created_at', { ascending: false });

    if (error) {
      console.log(error);
      return NextResponse.json({ message: error.message }, { status: 500 });
    }

    const artworks: Artwork[] = ((data ?? []) as unknown as LikeRow[])
      .filter(
        (
          like
        ): like is LikeRow & { artworks: NonNullable<LikeRow['artworks']> } =>
          like.artworks !== null
      )
      .map((like) => {
        const aw = like.artworks;
        return {
          id: aw.id,
          exhibitionId: aw.exhibitions?.id ?? '',
          title: aw.title,
          artist: aw.artist_name ?? '',
          description: aw.description ?? '',
          exhibitionTitle: aw.exhibitions?.title ?? '',
          academyName: aw.exhibitions?.profiles?.institution ?? '',
          imageUrl: aw.image_url ?? '',
          likesCount: aw.artwork_likes[0]?.count ?? 0,
          isLiked: true,
          createdAt: like.created_at,
        };
      });

    return NextResponse.json({ artworks }, { status: 200 });
  } catch (e) {
    console.log(e);
    return NextResponse.json({ message: 'unknown error' }, { status: 500 });
  }
}
