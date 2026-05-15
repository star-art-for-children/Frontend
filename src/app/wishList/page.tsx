import { redirect } from 'next/navigation';
import { headers } from 'next/headers';
import type { Artwork } from '@/components/myArtworks/Types';
import WishlistScreen from '@/components/wishList/WishlistScreen';

function getBaseUrl() {
  if (process.env.NEXT_PUBLIC_BASE_URL) return process.env.NEXT_PUBLIC_BASE_URL;
  if (process.env.VERCEL_URL) return `https://${process.env.VERCEL_URL}`;
  return 'http://localhost:3000';
}

export default async function WishlistPage() {
  const headersList = await headers();
  const cookie = headersList.get('cookie') ?? '';

  const res = await fetch(`${getBaseUrl()}/api/wishlist`, {
    headers: { cookie },
    cache: 'no-store',
  });

  if (res.status === 401) redirect('/login');
  if (!res.ok) throw new Error('wishlist fetch failed');

  const { artworks }: { artworks: Artwork[] } = await res.json();

  return <WishlistScreen artworks={artworks} />;
}
