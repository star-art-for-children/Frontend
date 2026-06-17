import { redirect, notFound } from 'next/navigation';
import { createClient } from '@/lib/supabase/server';
import { checkRole } from '@/lib/gallery/checkRole';
import { getBalance } from '@/lib/payments/credit';
import CreateGalleryPage from '@/components/exhibition-create/CreateGalleryPage';

export default async function page() {
  const supabase = await createClient();

  const result = await checkRole(supabase);

  if (!result.ok) {
    if (result.status === 401) {
      redirect('/login');
    }

    notFound();
  }

  const institution = result.user.user_metadata?.institution || '';
  const balance = await getBalance(result.user.id);
  return <CreateGalleryPage institution={institution} balance={balance} />;
}
