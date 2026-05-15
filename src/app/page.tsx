import { ExhibitionListContent } from '@/components/home/exhibitionListContent';
import SearchForm from '@/components/home/searchForm';
import { getAuthContext } from '@/lib/auth/getAuthContext';
import { ExhibitionSort } from '@/types/exhibitionList';
import { Sparkles } from 'lucide-react';
import Image from 'next/image';
import { redirect } from 'next/navigation';

export default async function Home({
  searchParams,
}: {
  searchParams: Promise<{ sort?: string; search?: string; page?: string }>;
}) {
  const { sort: sortParam, search, page: pageParams } = await searchParams;
  const page = Math.max(1, parseInt(pageParams ?? '1', 10));

  // 캐싱된 유저 데이터 조회(없다면 새로 요청)
  const { profile, user } = await getAuthContext();
  const isTeacher = profile?.role === 'teacher';

  if (sortParam === 'mine' && !isTeacher) {
    redirect('/');
  }
  const sort = (
    sortParam === 'mine' && !isTeacher ? 'latest' : (sortParam ?? 'latest')
  ) as ExhibitionSort;

  return (
    <main className="bg-[#FAF7F2]">
      {/* hero section */}
      <section className="relative isolate">
        {/* gradation bg image */}
        <Image
          src="/images/main_hero_bg.png"
          alt=""
          width={920}
          height={425}
          priority
          className="pointer-events-none absolute top-0 left-1/2 -z-1 h-auto w-[60%] -translate-x-1/2"
        />
        <div className="mx-auto max-w-6xl px-3.5 py-20 text-center">
          {/* hero title, text */}
          <div className="flex flex-col items-center gap-6">
            <span className="bg-primary/15 text-primary inline-flex items-center gap-1.5 rounded-full px-4 py-1.5 text-sm font-medium">
              <Sparkles className="h-4 w-4" />
              아이들의 꿈이 예술이 되는 곳
            </span>
            <h1 className="text-secondary text-4xl leading-tight font-bold md:text-5xl">
              아이들의 첫 미술전,
              <br />
              시작은 <span className="text-primary">스타아트</span>와 함께
            </h1>
            <p className="text-secondary/60 text-base leading-relaxed">
              미술 학원 선생님이 주최하는 아이들의 작품 전시회를
              <br />
              3D 가상 갤러리에서 자유롭게 관람하세요
            </p>
          </div>

          {/* search form */}
          <div className="mt-8 flex justify-center">
            <SearchForm />
          </div>
        </div>
      </section>
      {/* // hero section */}
      <ExhibitionListContent
        sort={sort}
        search={search}
        page={page}
        userId={user?.id}
        isTeacher={isTeacher}
        isLoggedIn={!!user}
      />
    </main>
  );
}
