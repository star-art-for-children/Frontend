import Image from 'next/image';
import Link from 'next/link';
import { ArrowLeft, Upload } from 'lucide-react';
import { Button } from '@/components/ui/button';
import {
  AddWorkDialog,
  DeleteArtworkDialog,
  EditWorkDialog,
  EndExhibitionDialog,
} from '@/components/exhibition/manage';
import { notFound, redirect } from 'next/navigation';
import { createClient } from '@/lib/supabase/server';
import { ArtworkWithEmail } from '@/types/artwork';

interface PageProps {
  params: Promise<{ id: string }>;
}

export default async function ExhibitionManagePage({ params }: PageProps) {
  const { id: exhibitionId } = await params;

  const supabase = await createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) redirect('/login');

  const { data: exhibition, error: exhibtionError } = await supabase
    .from('exhibitions')
    .select('*, profile:profiles!teacher_id ( institution )')
    .eq('id', exhibitionId)
    .single();

  if (!exhibition || exhibtionError) notFound();
  if (user.id !== exhibition.teacher_id) notFound();

  const { data, error: artworksError } = await supabase.rpc(
    'get_artworks_with_email',
    {
      p_exhibition_id: exhibitionId,
    }
  );
  if (artworksError) notFound();

  const artworks = data as ArtworkWithEmail[] | [];
  // const works = data.works ?? [];

  return (
    <main className="min-h-screen bg-[#FAF7F2] pb-20">
      <div className="mx-auto max-w-6xl space-y-6 px-3.5 pt-8">
        {/* 상단 헤더 */}
        <div className="flex items-start justify-between gap-4">
          <div className="flex items-center gap-3">
            <Link href={`/exhibitions/${exhibitionId}`}>
              <Button
                variant="ghost"
                size="icon"
                className="text-secondary/60 rounded-xl"
              >
                <ArrowLeft className="h-5 w-5" />
              </Button>
            </Link>
            <div>
              <h1 className="text-secondary text-2xl font-bold">
                {exhibition?.title}
              </h1>
              <p className="text-secondary/60 mt-0.5 text-sm">
                {Array.isArray(exhibition.profile)
                  ? exhibition.profile[0]?.institution
                  : exhibition.profile?.institution}{' '}
                · 작품 {artworks?.length}점
              </p>
            </div>
          </div>

          <EndExhibitionDialog
            exhibitionId={exhibitionId}
            startDate={exhibition.start_date}
          />
        </div>

        {/* 전시 소개 */}
        {exhibition.description && (
          <div className="rounded-2xl bg-white p-5 shadow-[0_2px_8px_rgba(44,40,38,0.06)]">
            <p className="text-secondary/70 text-sm leading-relaxed">
              {exhibition.description}
            </p>
          </div>
        )}

        {/* 작품 목록 헤더 */}
        <div className="flex items-center justify-end">
          <AddWorkDialog triggerClassName="px-4 py-5 font-bold" />
        </div>

        {/* 작품 그리드 / 빈 상태 */}
        {artworks.length === 0 ? (
          <div className="flex flex-col items-center justify-center gap-4 rounded-2xl bg-white py-20 shadow-[0_2px_8px_rgba(44,40,38,0.06)]">
            <div className="bg-primary/10 flex h-16 w-16 items-center justify-center rounded-4xl">
              <Upload className="text-primary h-6 w-6" />
            </div>
            <div className="text-center">
              <p className="text-secondary text-lg font-semibold">
                아직 등록한 작품이 없어요
              </p>
              <p className="text-secondary/60 mt-1 text-sm">
                첫 작품을 등록해보세요!
              </p>
            </div>
            <AddWorkDialog
              triggerLabel="첫 작품 등록하기"
              triggerClassName="mt-1 px-6 py-6 font-bold"
            />
          </div>
        ) : (
          <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-4">
            {artworks?.map((work) => (
              <div
                key={work.id}
                className="overflow-hidden rounded-2xl bg-white shadow-[0_2px_8px_rgba(44,40,38,0.06)]"
              >
                <div className="relative aspect-4/3 bg-[#F5EFE0]">
                  <Image
                    src={work.image_url}
                    alt={work.title}
                    fill
                    sizes="(min-width: 640px) 33vw, 50vw"
                    className="object-cover"
                  />
                </div>
                <div className="p-3">
                  <p className="text-secondary text-sm font-semibold">
                    {work.title}
                  </p>
                  <p className="text-secondary/60 text-xs">
                    {work.artist_name}
                  </p>
                  <div className="mt-3 flex gap-2">
                    <EditWorkDialog work={work} />
                    <DeleteArtworkDialog
                      exhibitionId={exhibitionId}
                      artworkId={work.id}
                      artworkTitle={work.title}
                    />
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </main>
  );
}
