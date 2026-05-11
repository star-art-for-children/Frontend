import { redirect } from 'next/navigation';
import { createClient } from '@/lib/supabase/server';
import type { Artwork } from '@/components/myArtworks/Types';
import WishlistScreen from '@/components/wishList/WishlistScreen';

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
      title: string;
      profiles: { institution: string | null } | null;
    } | null;
  } | null;
};

export default async function WishlistPage() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) redirect('/login');

  const { data, error } = await supabase
    .from('artwork_likes')
    .select(
      `created_at,
      artworks (
        id, title, artist_name, description, image_url,
        artwork_likes(count),
        exhibitions ( title, profiles!teacher_id ( institution ) )
      )`
    )
    .eq('user_id', user.id)
    .order('created_at', { ascending: false });

  if (error) throw new Error(error.message);

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
        title: aw.title,
        artist: aw.artist_name ?? '',
        description: aw.description ?? '',
        exhibitionTitle: aw.exhibitions?.title ?? '',
        academyName: aw.exhibitions?.profiles?.institution ?? '',
        imageUrl: aw.image_url ?? '',
        likesCount: aw.artwork_likes[0]?.count ?? 0,
        createdAt: like.created_at,
      };
    });

  return <WishlistScreen artworks={artworks} />;
}
