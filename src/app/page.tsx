import ExhibitionList from '@/components/home/exhibitionList';
import { ExhibitionProps } from '@/types/exhibitionList';
import { Search, Sparkles } from 'lucide-react';
import Image from 'next/image';

const exhibitions: ExhibitionProps[] = [
  {
    id: '1',
    title: '여름 날씨전',
    host: '해피아트 미술학원',
    image: '/images/sample_thumb.png',
    startDate: '2026-05-28',
    likes: 0,
  },
  {
    id: '2',
    title: '사계절 이야기',
    host: '해피아트 미술학원',
    startDate: '2026-04-01',
    endDate: '2026-05-31',
    likes: 45,
  },
  {
    id: '3',
    title: '봄의 소리전',
    host: '해피아트 미술학원',
    image: '/images/sample_thumb.png',
    startDate: '2026-03-01',
    endDate: '2026-05-31',
    likes: 128,
  },
  {
    id: '4',
    title: '겨울 풍경전',
    host: '꿈나무 창작학원',
    image: '/images/sample_thumb.png',
    startDate: '2025-12-01',
    endDate: '2026-02-28',
    likes: 312,
  },
];

export default function Home() {
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
          className="absolute top-0 left-1/2 -z-10 h-auto w-[60%] -translate-x-1/2"
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
            <form
              role="search"
              className="mt-6 flex w-full max-w-xl items-center gap-3 rounded-xl bg-white p-5 shadow-[0_2px_12px_rgba(44,40,38,0.06)]"
            >
              <Search className="text-secondary/40 h-5 w-5 shrink-0" />
              <input
                type="search"
                placeholder="전시회 이름, 교육기관 검색..."
                className="text-secondary placeholder:text-secondary/40 w-full bg-transparent text-sm focus:outline-none"
              />
            </form>
          </div>
        </div>
      </section>
      {/* // hero section */}
      <div className="mx-auto max-w-6xl px-3.5 pb-20">
        <ExhibitionList
          exhibitions={exhibitions}
          isLoggedIn={true}
          isTeacher
          currentHost="해피아트 미술학원"
        />
      </div>
    </main>
  );
}
