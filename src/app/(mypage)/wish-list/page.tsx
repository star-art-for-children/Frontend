import { redirect } from 'next/navigation';
import { getAuthContext } from '@/lib/auth/getAuthContext';
import { createClient } from '@/lib/supabase/server';
import type { Artwork } from '@/types/artwork';
import WishlistScreen from '@/components/my-wishlist/WishlistScreen';

type LikeRow = {
  artworks: {
    id: string;
    title: string;
    artist_name: string | null;
    description: string | null;
    image_url: string | null;
    created_at: string;
    artwork_likes: { count: number }[];
    exhibitions: {
      id: string;
      title: string;
      profiles: { institution: string | null } | null;
    } | null;
  } | null;
};

export default async function WishlistPage() {
  const { user, onboarded } = await getAuthContext();

  if (!user) redirect('/login');
  if (!onboarded) redirect('/onboarding');

  const supabase = await createClient();
  const { data, error } = await supabase
    .from('artwork_likes')
    .select(
      `artworks (
        id, title, artist_name, description, image_url, created_at,
        artwork_likes(count),
        exhibitions ( id, title, profiles!teacher_id ( institution ) )
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
        exhibitionId: aw.exhibitions?.id ?? '',
        title: aw.title,
        artist: aw.artist_name ?? '',
        description: aw.description ?? '',
        exhibitionTitle: aw.exhibitions?.title ?? '',
        academyName: aw.exhibitions?.profiles?.institution ?? '',
        imageUrl: aw.image_url ?? '',
        likesCount: aw.artwork_likes[0]?.count ?? 0,
        isLiked: true,
        createdAt: aw.created_at,
      };
    });

  return <WishlistScreen artworks={artworks} />;
}
