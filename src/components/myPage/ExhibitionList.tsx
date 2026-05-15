'use client';

import { useState } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { Calendar } from 'lucide-react';
import { cn } from '@/lib/utils';
import type { Exhibition } from '@/types/myPage';

type Filter = 'all' | 'active' | 'upcoming' | 'ended';

const FILTERS: { label: string; value: Filter }[] = [
  { label: '전체', value: 'all' },
  { label: '진행중', value: 'active' },
  { label: '예정됨', value: 'upcoming' },
  { label: '종료', value: 'ended' },
];

interface ExhibitionListProps {
  exhibitions: Exhibition[];
}

export default function ExhibitionList({ exhibitions }: ExhibitionListProps) {
  const [filter, setFilter] = useState<Filter>('all');

  const filtered =
    filter === 'all'
      ? exhibitions
      : exhibitions.filter((ex) => ex.status === filter);

  return (
    <section className="overflow-hidden rounded-[24px] border border-[#e8e1d7] bg-white shadow-[0_2px_8px_rgba(64,48,33,0.03)]">
      <div className="flex items-center justify-between px-7 pt-6 pb-4">
        <div className="flex items-center gap-2">
          <svg width="15" height="15" viewBox="0 0 16 16" fill="none">
            <circle cx="8" cy="8" r="6.2" stroke="#8f877f" strokeWidth="1.2" />
            <path
              d="M5.5 8a2.5 2.5 0 005 0 2.5 2.5 0 00-5 0z"
              stroke="#8f877f"
              strokeWidth="1.2"
            />
            <path
              d="M8 5.5v1M8 9.5v1M5.5 8h-1M11.5 8h-1"
              stroke="#8f877f"
              strokeWidth="1.1"
              strokeLinecap="round"
            />
          </svg>
          <span className="text-[15px] font-bold text-[#26221f]">
            내가 운영하는 전시회
          </span>
        </div>

        <div className="flex items-center gap-1">
          {FILTERS.map(({ label, value }) => (
            <button
              key={value}
              onClick={() => setFilter(value)}
              className={cn(
                'rounded-full px-4 py-2 text-sm font-medium transition-colors',
                filter === value
                  ? 'bg-primary text-primary-foreground'
                  : 'bg-white text-secondary/60 hover:bg-primary/10 hover:text-secondary'
              )}
            >
              {label}
            </button>
          ))}
        </div>
      </div>

      <ul className="px-5 pb-5">
        {filtered.length === 0 ? (
          <li className="px-3 py-6 text-center text-[13px] text-[#c3bcb2]">
            해당되는 전시회가 없습니다.
          </li>
        ) : (
          filtered.map((ex, idx) => (
            <li key={ex.id}>
              <Link
                href={`/exhibitions/${ex.id}`}
                className={`flex items-center gap-4 rounded-[18px] px-3 py-3 transition-colors hover:bg-[#faf7f1] ${
                  idx > 0 ? 'mt-1' : ''
                }`}
              >
                <Image
                  src={ex.thumbnail || '/images/default_thumb.jpg'}
                  alt=""
                  width={44}
                  height={44}
                  className="shrink-0 rounded-[14px] object-cover"
                />

                <div className="min-w-0 flex-1">
                  <p className="mb-1 text-[14px] font-semibold text-[#2b2724]">
                    {ex.title}
                  </p>
                  {ex.status === 'upcoming' ? (
                    <p className="flex items-center gap-1 text-[12px] text-[#e2a93a]">
                      <Calendar size={11} />
                      {ex.start_date}부터 관람 가능
                    </p>
                  ) : (
                    <p className="text-[12px] text-[#9b948c]">
                      {ex.artworkCount}점 ·{' '}
                      {ex.status === 'active' ? '진행중' : '종료'}
                    </p>
                  )}
                </div>

                <div className="flex items-center gap-3">
                  <span
                    className={`rounded-full px-2.5 py-1 text-[11px] font-semibold ${
                      ex.status === 'active'
                        ? 'bg-[#ecfaf2] text-[#43b77a]'
                        : ex.status === 'upcoming'
                          ? 'bg-[#fff4d9] text-[#d5981f]'
                          : 'bg-[#f4f3f1] text-[#bbb3a8]'
                    }`}
                  >
                    {ex.status === 'active'
                      ? '진행중'
                      : ex.status === 'upcoming'
                        ? '예정됨'
                        : '종료'}
                  </span>
                  <svg width="14" height="14" viewBox="0 0 16 16" fill="none">
                    <path
                      d="M6 4l4 4-4 4"
                      stroke="#c3bcb2"
                      strokeWidth="1.5"
                      strokeLinecap="round"
                    />
                  </svg>
                </div>
              </Link>
            </li>
          ))
        )}
      </ul>
    </section>
  );
}
