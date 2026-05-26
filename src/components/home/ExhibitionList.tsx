'use client';

import Link from 'next/link';
import { Plus, Star } from 'lucide-react';
import { useTransition } from 'react';
import { ExhibitionListItem, ExhibitionSort } from '@/types/exhibition';
import { cn } from '@/lib/utils';
import ExhibitionFilter from './ExhibitionFilter';
import ExhibitionCard from './ExhibitionCard';

interface ExhibitionListProps {
  exhibitions: ExhibitionListItem[];
  sort: ExhibitionSort;
  isTeacher?: boolean;
  isLoggedIn?: boolean;
}

export default function ExhibitionList({
  exhibitions,
  sort,
  isLoggedIn,
  isTeacher = false,
}: ExhibitionListProps) {
  const [isPending, startTransition] = useTransition();

  return (
    <section id="exhibition-list" className="scroll-mt-20 space-y-6">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <ExhibitionFilter
          value={sort}
          isTeacher={isTeacher}
          isPending={isPending}
          startTransition={startTransition}
        />
        {/* 선생님 계정만 추가 */}
        {isTeacher && (
          <Link
            href="/exhibitions/create"
            className="bg-primary inline-flex items-center gap-1.5 rounded-full px-5 py-2 text-sm font-semibold text-white shadow-sm transition-colors hover:bg-[#E09415]"
          >
            <Plus className="h-4 w-4" />
            전시회 만들기
          </Link>
        )}
        {/* //선생님 계정만 추가 */}
      </div>

      <div
        className={cn(
          'transition-opacity',
          isPending && 'pointer-events-none relative opacity-50'
        )}
      >
        {exhibitions.length === 0 ? (
          <div className="flex flex-col items-center justify-center gap-1 py-28 text-center">
            <div className="bg-primary/10 mb-4 flex h-20 w-20 items-center justify-center rounded-2xl">
              <Star className="text-primary h-10 w-10" strokeWidth={2} />
            </div>
            <h3 className="text-secondary text-lg font-bold">
              전시회가 없어요
            </h3>
            <p className="text-secondary/40 text-sm">
              아직 등록된 전시회가 없습니다
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-4">
            {exhibitions.map((exhibition) => (
              <ExhibitionCard
                key={exhibition.id}
                exhibition={exhibition}
                isLoggedIn={isLoggedIn}
              />
            ))}
          </div>
        )}
      </div>
    </section>
  );
}
