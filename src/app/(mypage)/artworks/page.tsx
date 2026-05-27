import { redirect } from 'next/navigation';
import { createClient } from '@/lib/supabase/server';
import type { Artwork } from '@/types/artwork';
import ArtworksScreen from '@/components/my-artworks/ArtworksScreen';

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

export default async function MyArtworksPage() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) redirect('/login');

  const [{ data, error }, { data: likedData, error: likedError }] =
    await Promise.all([
      supabase
        .from('artworks')
        .select(
          `id, title, artist_name, description, image_url, created_at,
        artwork_likes(count),
        exhibitions ( id, title, profiles!teacher_id ( institution ) )`
        )
        .eq('artist_id', user.id)
        .order('created_at', { ascending: false }),
      supabase
        .from('artwork_likes')
        .select('artwork_id')
        .eq('user_id', user.id),
    ]);

  if (error) throw new Error(error.message);
  if (likedError) throw new Error(likedError.message);

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

  return <ArtworksScreen artworks={artworks} />;
}
