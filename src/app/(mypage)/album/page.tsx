import { redirect } from 'next/navigation';
import { createClient } from '@/lib/supabase/server';
import AlbumScreen from '@/components/album/AlbumScreen';
import type {
  AlbumArtwork,
  AlbumMeta,
} from '@/components/album/AlbumPdfDocument';

type RawAlbumArtwork = {
  id: string;
  title: string | null;
  artist_name: string | null;
  image_url: string | null;
  created_at: string;
  exhibitions: { title: string | null } | null;
};

export default async function AlbumPage() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) redirect('/login');

  // 표지에 쓸 아이 이름
  const { data: profileData } = await supabase
    .from('profiles')
    .select('username, onboarded')
    .eq('id', user.id)
    .single();

  if (!profileData?.onboarded) redirect('/onboarding');

  const childName =
    profileData?.username ??
    user.user_metadata?.username ??
    user.email?.split('@')[0] ??
    '사용자';

  // 내 작품을 오래된 → 최신 순으로 (성장 타임라인)
  const { data, error } = await supabase
    .from('artworks')
    .select(
      `id, title, artist_name, image_url, created_at,
       exhibitions ( title )`
    )
    .eq('artist_id', user.id)
    .order('created_at', { ascending: true });

  if (error) throw new Error(error.message);

  const raw = (data ?? []) as unknown as RawAlbumArtwork[];

  const artworks: AlbumArtwork[] = raw.map((r) => ({
    id: r.id,
    title: r.title ?? '',
    artist: r.artist_name ?? '',
    exhibitionTitle: r.exhibitions?.title ?? '',
    imageUrl: r.image_url ?? '',
    createdAt: r.created_at,
  }));

  const meta: AlbumMeta = {
    childName,
    artworkCount: artworks.length,
    periodStart: artworks[0]?.createdAt ?? null,
    periodEnd: artworks[artworks.length - 1]?.createdAt ?? null,
  };

  return <AlbumScreen artworks={artworks} meta={meta} />;
}
