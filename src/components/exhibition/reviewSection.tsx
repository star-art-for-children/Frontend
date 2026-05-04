'use client';

import { useState } from 'react';
import { Trash2 } from 'lucide-react';
import { cn } from '@/lib/utils';

export interface Review {
  id: string;
  author: string;
  date: string;
  content: string;
}

interface ReviewSectionProps {
  initialReviews?: Review[];
  isLoggedIn?: boolean;
  currentUser?: string;
}

export default function ReviewSection({
  initialReviews,
  isLoggedIn = false,
  currentUser,
}: ReviewSectionProps) {
  const [reviews] = useState<Review[]>(initialReviews ?? []);
  const [input, setInput] = useState('');

  return (
    <section className="space-y-4 rounded-2xl bg-white p-6 shadow-[0_2px_8px_rgba(44,40,38,0.06)]">
      <strong className="text-secondary mb-3 block text-lg font-bold">
        관람 후기 ({reviews.length})
      </strong>

      {/* 입력 영역 */}
      {isLoggedIn ? (
        <form className="space-y-3">
          <textarea
            value={input}
            onChange={(e) => setInput(e.target.value)}
            placeholder="전시회 관람 후기를 남겨주세요..."
            rows={3}
            className="text-secondary placeholder:text-secondary/40 focus:border-primary w-full resize-none rounded-xl border border-[#E8DFC8] bg-[#FAF7F2] px-4 py-3 text-sm focus:outline-none"
          />
          <div className="flex justify-end">
            <button
              type="submit"
              disabled={!input.trim()}
              className={cn(
                'rounded-xl px-5 py-2 text-sm font-semibold transition-colors',
                input.trim()
                  ? 'bg-primary text-white hover:bg-[#E09415]'
                  : 'bg-primary/40 cursor-not-allowed text-white'
              )}
            >
              후기 등록
            </button>
          </div>
        </form>
      ) : (
        <div className="bg-primary/10 text-secondary/70 rounded-xl px-4 py-3 text-center text-sm">
          <span className="text-primary font-semibold">로그인</span>
          하면 후기를 남길 수 있어요
        </div>
      )}

      {/* 후기 리스트 */}
      <ul className="space-y-4 pt-2">
        {reviews.length !== 0 ? (
          reviews.map((review) => {
            const isMine = currentUser && review.author === currentUser;

            return (
              <li key={review.id} className="flex gap-3">
                <span className="bg-primary/15 text-primary flex h-9 w-9 shrink-0 items-center justify-center rounded-full text-sm font-semibold">
                  {review.author.charAt(0)}
                </span>
                <div className="flex-1 space-y-1">
                  <div className="flex items-center gap-2">
                    <span className="text-secondary text-sm font-semibold">
                      {review.author}
                    </span>
                    <span className="text-secondary/40 text-xs">
                      {review.date}
                    </span>
                  </div>
                  <p className="text-secondary/70 text-sm leading-relaxed">
                    {review.content}
                  </p>
                </div>

                {isMine && (
                  <button
                    type="button"
                    aria-label="후기 삭제"
                    className="text-secondary/40 hover:text-secondary/80 hover:bg-secondary/5 flex h-8 w-8 shrink-0 items-center justify-center rounded-full transition-colors"
                  >
                    <Trash2 className="h-4 w-4" />
                  </button>
                )}
              </li>
            );
          })
        ) : (
          <p className="text-secondary/30 flex flex-col items-center justify-center gap-1 py-28 text-center">
            아직 후기가 없어요. 첫 번째 후기를 남겨보세요!
          </p>
        )}
      </ul>
    </section>
  );
}
