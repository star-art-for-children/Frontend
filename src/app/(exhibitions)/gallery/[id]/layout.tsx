import { ReactNode } from 'react';
import { createClient } from '@/lib/supabase/server';
import { notFound } from 'next/navigation';
import { getStatus } from '@/lib/exhibition/dateStatus';
import { ExhibitionEnded, ExhibitionUpcoming } from '@/components/exhibition';
import { ExhibitionRow } from '@/types/exhibitionList';

export default async function Layout({
  children,
  params,
}: {
  children: ReactNode;
  params: Promise<{ id: string }>;
}) {
  const { id: exhibitionId } = await params;
  const supabase = await createClient();

  const { data, error } = await supabase
    .from('exhibitions')
    .select(
      'title,start_date,end_date,teacher_id,profile:profiles!teacher_id ( institution )'
    )
    .eq('id', exhibitionId)
    .single<ExhibitionRow>();

  if (error || !data) notFound();

  const { title, start_date, end_date, profile } = data;
  const status = getStatus(start_date, end_date ?? undefined);

  const institution = Array.isArray(profile)
    ? profile[0]?.institution
    : profile?.institution;

  if (status === 'ended')
    return <ExhibitionEnded title={title} endDate={end_date ?? ''} />;
  if (status === 'upcoming')
    return (
      <ExhibitionUpcoming
        id={'?'}
        title={title}
        host={institution ?? ''}
        startDate={start_date}
      />
    );
  return <>{children}</>;
}
