import Image from 'next/image';
import { ArrowRight, Calendar, Heart, Settings, Star } from 'lucide-react';
import { formatDate, getStatus } from '@/lib/exhibition/dateStatus';

import { Button } from '@/components/ui/button';
import { notFound } from 'next/navigation';
import Link from 'next/link';
import {
  ExhibitionEnded,
  ExhibitionUpcoming,
  ReviewSection,
  WorkDialog,
} from '@/components/exhibition';

interface Work {
  id: string;
  title: string;
  artist: string;
  image: string;
  description?: string;
  likes?: number;
}

interface Review {
  id: string;
  author: string;
  date: string;
  content: string;
}

interface ExhibitionDetail {
  id: string;
  title: string;
  host: string;
  banner: string;
  startDate: string;
  endDate?: string;
  totalLikes: number;
  description?: string;
  works?: Work[];
  reviews?: Review[];
}

const mockExhibitionDetail: Record<string, ExhibitionDetail> = {
  '2': {
    id: '2',
    title: '봄의 소리전',
    host: '해피아트 미술학원',
    banner: '/images/sample_thumb.png',
    startDate: '2026-03-01',
    totalLikes: 201,
    works: [
      {
        id: 'w1',
        title: '봄날의 꿈',
        artist: '이소율',
        image: '/images/sample_thumb.png',
        description:
          '봄에 피어난 벚꽃을 보며 느낀 따뜻한 기분을 그렸어요. 분홍색 꽃잎이 바람에 날리는 모습이 가장 좋아하는 장면이에요.',
        likes: 12,
      },
    ],
    reviews: [],
  },
  '3': {
    id: '3',
    title: '봄의 소리전',
    host: '해피아트 미술학원',
    banner: '/images/sample_thumb.png',
    startDate: '2026-03-01',
    endDate: '2026-05-31',
    totalLikes: 201,
    description:
      '해피아트 미술학원 학생들이 봄을 주제로 그린 작품들을 전시합니다. 따뜻한 봄날의 감성을 아이들의 순수한 시선으로 담아낸 작품들을 감상해보세요. 총 12명의 학생이 참가했으며, 각자의 개성 넘치는 봄 이야기를 담았습니다.',
    works: [
      {
        id: 'w1',
        title: '봄날의 꿈',
        artist: '이소율',
        image: '/images/sample_thumb.png',
        description:
          '봄에 피어난 벚꽃을 보며 느낀 따뜻한 기분을 그렸어요. 분홍색 꽃잎이 바람에 날리는 모습이 가장 좋아하는 장면이에요.',
        likes: 12,
      },
      {
        id: 'w2',
        title: '바다의 노래',
        artist: '최지민',
        image: '/images/sample_thumb.png',
        description:
          '제주도 여행에서 바라본 에메랄드빛 바다를 담았습니다. 파도 소리가 들리는 것 같은 그림을 그리고 싶었어요.',
        likes: 31,
      },
      {
        id: 'w3',
        title: '우리 가족',
        artist: '김도현',
        image: '/images/sample_thumb.png',
        description:
          '가족과 함께 보낸 즐거운 시간을 그림으로 표현했어요. 모두가 웃고 있는 모습이 가장 행복했습니다.',
        likes: 18,
      },
    ],
    reviews: [
      {
        id: 'r1',
        author: '박관람',
        date: '2026-03-15',
        content:
          '아이들의 작품이 정말 놀라웠어요! 봄의 느낌을 이렇게 잘 표현할 수 있다니 대단합니다. 특히 소율이의 봄날의 꿈이 너무 예뻤어요.',
      },
      {
        id: 'r2',
        author: '최부모',
        date: '2026-03-20',
        content:
          '저희 아이 작품이 전시된다니 너무 감격스럽네요. 선생님께서 정말 정성스럽게 전시해 주셨어요. 감사합니다!',
      },
    ],
  },
  '4': {
    id: '4',
    title: '겨울 풍경전',
    host: '꿈나무 창작학원',
    banner: '/images/sample_thumb.png',
    startDate: '2025-12-01',
    endDate: '2026-02-28',
    totalLikes: 312,
  },
  '1': {
    id: '1',
    title: '여름 날씨전',
    host: '해피아트 미술학원',
    banner: '/images/sample_thumb.png',
    startDate: '2026-08-01',
    totalLikes: 0,
  },
};

interface PageProps {
  params: Promise<{ id: string }>;
}

// TODO: 추후 인증 연결
const mockSession = {
  isLoggedIn: true,
  isTeacher: true,
  currentUser: '박관람',
  isOwner: true,
  isLiked: true,
};

export default async function ExhibitionDetail({ params }: PageProps) {
  // 임시연결
  const { id } = await params;
  const exhibition = mockExhibitionDetail[id];
  const { isTeacher, isLoggedIn, currentUser, isOwner, isLiked } = mockSession;

  if (!exhibition) notFound();

  const status = getStatus(exhibition.startDate, exhibition.endDate);
  const dateText = formatDate(exhibition.startDate, exhibition.endDate);

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
        isTeacher={isTeacher}
      />
    );
  }

  return (
    <main className="bg-[#FAF7F2] pb-20">
      {/* 배너 영역 */}
      <section className="relative h-80 w-full overflow-hidden">
        <Image
          src={exhibition.banner}
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
        <div className="flex flex-wrap items-center justify-between gap-4 rounded-2xl bg-white p-5 shadow-[0_2px_8px_rgba(44,40,38,0.06)]">
          <div className="text-secondary/70 flex flex-wrap items-center gap-x-6 gap-y-2 text-sm">
            <span className="inline-flex items-center gap-1.5">
              <Calendar className="text-primary h-4 w-4" />
              {dateText}
            </span>
            <span className="inline-flex items-center gap-1.5">
              <Heart className="h-4 w-4 text-red-500" />총 좋아요{' '}
              {exhibition.totalLikes}
            </span>
            <span className="inline-flex items-center gap-1.5">
              <Star className="text-primary h-4 w-4" />
              작품 {exhibition.works?.length}점
            </span>
          </div>

          <div className="flex flex-wrap items-center gap-2">
            {isOwner && (
              <Link
                href={`/exhibitions/${exhibition.id}/manage`}
                className="text-secondary/60 hover:bg-primary/20 inline-flex h-9 items-center gap-1.5 rounded-xl bg-[#FAF7F2] px-2.5 text-sm font-medium transition-colors"
              >
                <Settings className="h-4 w-4" />
                전시회 관리
              </Link>
            )}
            {isLiked ? (
              <Button
                size="lg"
                className="rounded-xl bg-red-50 text-red-500 transition-colors hover:bg-red-100"
              >
                <Heart className="h-4 w-4 fill-red-500" />
                좋아요 취소
              </Button>
            ) : (
              <Button
                size="lg"
                className="text-secondary/60 hover:bg-primary/20 rounded-xl bg-[#FAF7F2] transition-colors"
              >
                <Heart className="h-4 w-4" />
                좋아요
              </Button>
            )}
            <Link
              href={`/gallery/${exhibition.id}`}
              className="bg-primary inline-flex h-9 items-center gap-1.5 rounded-xl px-2.5 text-sm font-medium text-white transition-colors hover:bg-[#E09415]"
            >
              <span>🎨</span>
              전시회 입장하기
              <ArrowRight className="h-4 w-4" />
            </Link>
          </div>
        </div>

        {/* 전시회 소개 */}
        <section className="space-y-3 rounded-2xl bg-white p-6 shadow-[0_2px_8px_rgba(44,40,38,0.06)]">
          <h2 className="text-secondary text-lg font-bold">전시회 소개</h2>
          <p className="text-secondary/70 text-sm leading-relaxed">
            {exhibition.description}
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
                  work={work}
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
          initialReviews={exhibition.reviews}
          isLoggedIn={isLoggedIn}
          currentUser={currentUser}
        />
      </div>
    </main>
  );
}
