import Image from 'next/image';
import { ArrowRight } from 'lucide-react';
import { getStatus } from '@/lib/exhibition/dateStatus';
import { notFound } from 'next/navigation';
import Link from 'next/link';
import {
  ExhibitionEnded,
  ExhibitionUpcoming,
  ReviewSection,
  WorkDialog,
  ExhibitionActionBar,
} from '@/components/exhibition';
import { fetchExhibitionDetail } from '@/lib/exhibition/server';
import { fetchExhibitionReviews } from '@/lib/review/server';

export default async function ExhibitionDetail({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const [exhibition, reviews] = await Promise.all([
    fetchExhibitionDetail(id),
    fetchExhibitionReviews(id, { page: 1 }),
  ]);

  if (!exhibition) notFound();

  const limit = reviews.pagination.limit || 10;
  const totalPages = Math.max(
    1,
    Math.ceil(reviews.pagination.totalCount / limit)
  );

  const { isLoggedIn, isOwner, isLiked, currentUserId } = exhibition;

  const status = getStatus(
    exhibition.startDate,
    exhibition.endDate ?? undefined
  );

  // 종료된 전시
  if (status === 'ended') {
    return (
      <ExhibitionEnded
        title={exhibition.title}
        endDate={exhibition.endDate ?? exhibition.startDate}
      />
    );
  }

  // 예정된 전시
  if (status === 'upcoming') {
    return (
      <ExhibitionUpcoming
        id={exhibition.id}
        title={exhibition.title}
        host={exhibition.host}
        startDate={exhibition.startDate}
        isTeacher={isOwner} // 주인이면 관리 가능
      />
    );
  }

  return (
    <main className="bg-[#FAF7F2] pb-20">
      {/* 배너 영역 */}
      <section className="relative h-80 w-full overflow-hidden">
        <Image
          src={exhibition.image || '/images/default_banner.jpg'}
          alt={exhibition.title}
          fill
          priority
          className="object-cover"
          sizes="100vw"
        />
        <div className="absolute inset-0 bg-linear-to-t from-black/70 via-black/20 to-transparent" />
        <div className="absolute right-0 bottom-0 left-0 mx-auto max-w-6xl px-3.5 pb-8">
          {status === 'ongoing' && (
            <span className="bg-primary mb-3 inline-flex items-center rounded-full px-3 py-1 text-xs font-semibold text-white">
              진행중
            </span>
          )}
          <h1 className="text-3xl font-bold text-white md:text-4xl">
            {exhibition.title}
          </h1>
          <p className="mt-2 text-sm text-white/80">{exhibition.host}</p>
        </div>
      </section>

      <div className="mx-auto max-w-6xl space-y-6 px-3.5 pt-6">
        {/* 정보 + 액션 바 */}
        <ExhibitionActionBar
          exhibition={exhibition}
          isLiked={isLiked}
          isLoggedIn={isLoggedIn}
          isOwner={isOwner}
        />

        {/* 전시회 소개 */}
        <section className="space-y-3 rounded-2xl bg-white p-6 shadow-[0_2px_8px_rgba(44,40,38,0.06)]">
          <h2 className="text-secondary text-lg font-bold">전시회 소개</h2>
          <p className="text-secondary/70 text-sm leading-relaxed">
            {exhibition.description || '소개 내용이 없습니다.'}
          </p>
        </section>

        {/* 전시 작품 */}
        {exhibition.works && exhibition.works.length > 0 && (
          <section className="space-y-4">
            <h2 className="text-secondary text-lg font-bold">
              전시 작품 ({exhibition.works.length}점)
            </h2>
            <div className="grid grid-cols-4 gap-4 sm:grid-cols-6 lg:grid-cols-8">
              {exhibition.works.map((work) => (
                <WorkDialog
                  key={work.id}
                  work={{
                    id: work.id,
                    title: work.title,
                    artist: work.artist,
                    image: work.image,
                    description: work.description ?? undefined,
                    likes: work.likes,
                    liked: work.liked,
                  }}
                  exhibitionId={exhibition.id}
                  exhibitionTitle={exhibition.title}
                  exhibitionHost={exhibition.host}
                  isLoggedIn={isLoggedIn}
                />
              ))}
            </div>
          </section>
        )}

        {/* 3D 갤러리 입장 버튼 섹션 */}
        <section className="overflow-hidden rounded-2xl bg-linear-to-r from-[#F5A623] to-[#F37C5A] p-8 text-center text-white">
          <h2 className="text-xl font-bold">3D 가상 전시장에서 관람하기</h2>
          <p className="mt-2 text-sm text-white/90">
            실제 갤러리를 걷는 것처럼 작품을 감상해보세요
          </p>
          <Link
            href={`/gallery/${exhibition.id}`}
            className="mt-5 inline-flex h-12 items-center gap-1.5 rounded-xl bg-white px-7 text-sm font-medium text-[#F5A623] shadow-sm transition-colors hover:bg-white/90"
          >
            <span>🎨</span>
            전시회 입장하기
            <ArrowRight className="h-4 w-4" />
          </Link>
        </section>

        {/* 관람 후기 */}
        <ReviewSection
          exhibitionId={id}
          reviews={reviews.data}
          totalCount={reviews.pagination.totalCount}
          totalPages={totalPages}
          isLoggedIn={isLoggedIn}
          currentUserId={currentUserId ?? undefined}
        />
      </div>
    </main>
  );
}
