import { redirect } from 'next/navigation';
import { headers } from 'next/headers';
import type { Artwork } from '@/components/myArtworks/Types';
import ArtworksScreen from '@/components/myArtworks/ArtworksScreen';

function getBaseUrl() {
  if (process.env.NEXT_PUBLIC_BASE_URL) return process.env.NEXT_PUBLIC_BASE_URL;
  if (process.env.VERCEL_URL) return `https://${process.env.VERCEL_URL}`;
  return 'http://localhost:3000';
}

export default async function MyArtworksPage() {
  const headersList = await headers();
  const cookie = headersList.get('cookie') ?? '';

  const res = await fetch(`${getBaseUrl()}/api/artworks`, {
    headers: { cookie },
    cache: 'no-store',
  });

  if (res.status === 401) redirect('/login');
  if (!res.ok) throw new Error('artworks fetch failed');

  const { artworks }: { artworks: Artwork[] } = await res.json();

  return <ArtworksScreen artworks={artworks} />;
}
