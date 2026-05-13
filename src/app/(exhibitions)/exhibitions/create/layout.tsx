import { redirect, notFound } from 'next/navigation';
import { createClient } from '@/lib/supabase/server';
import { checkRole } from '@/components/galleryExhibition/threejs/test/util/util';

export default async function Layout({
  children,
}: {
  children: React.ReactNode;
}) {
  const supabase = await createClient();

  const result = await checkRole(supabase);

  if (!result.ok) {
    if (result.status === 401) {
      redirect('/login');
    }

    notFound();
  }

  return <>{children}</>;
}
