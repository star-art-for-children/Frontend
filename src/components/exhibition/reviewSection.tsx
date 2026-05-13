'use client';

import { FormEvent, useState } from 'react';
import { cn } from '@/lib/utils';
import ReviewPagination from './reviewPagination';
import ReviewAlertDialog from './reviewAlertDialog';
import {
  deleteReview,
  fetchReviewsPage,
  postReview,
  ReviewData,
} from '@/service/exhibitions';

export type Review = ReviewData;

interface ReviewSectionProps {
  exhibitionId: string;
  reviews: Review[];
  totalCount: number;
  totalPages: number;
  isLoggedIn?: boolean;
  currentUserId?: string;
}

export default function ReviewSection({
  exhibitionId,
  reviews: initialReviews,
  totalCount: initialTotalCount,
  totalPages: initialTotalPages,
  isLoggedIn = false,
  currentUserId,
}: ReviewSectionProps) {
  const [reviews, setReviews] = useState<Review[]>(initialReviews);
  const [totalCount, setTotalCount] = useState(initialTotalCount);
  const [totalPages, setTotalPages] = useState(initialTotalPages);
  const [currentPage, setCurrentPage] = useState(1);
  const [input, setInput] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [deletingId, setDeletingId] = useState<string | null>(null);

  const loadPage = async (page: number) => {
    const data = await fetchReviewsPage(exhibitionId, page);
    setReviews(data.reviews);
    setTotalCount(data.totalCount);
    setTotalPages(data.totalPages);
    setCurrentPage(page);
  };

  const handlePageChange = async (page: number) => {
    if (page === currentPage) return;
    try {
      await loadPage(page);
    } catch (err) {
      console.error(err);
      alert(err instanceof Error ? err.message : '후기를 불러오지 못했습니다');
    }
  };

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    const content = input.trim();
    if (!content || isSubmitting) return;

    setIsSubmitting(true);
    try {
      await postReview(exhibitionId, content);
      setInput('');
      await loadPage(1);
    } catch (err) {
      console.error(err);
      alert(err instanceof Error ? err.message : '후기 등록에 실패했습니다');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDelete = async (reviewId: string) => {
    if (deletingId) return;
    setDeletingId(reviewId);

    try {
      await deleteReview(exhibitionId, reviewId);
      const nextLength = reviews.length - 1;
      const targetPage =
        nextLength === 0 && currentPage > 1 ? currentPage - 1 : currentPage;
      await loadPage(targetPage);
    } catch (err) {
      console.error(err);
      alert(err instanceof Error ? err.message : '후기 삭제에 실패했습니다');
    } finally {
      setDeletingId(null);
    }
  };

  return (
    <section className="space-y-4 rounded-2xl bg-white p-6 shadow-[0_2px_8px_rgba(44,40,38,0.06)]">
      <strong className="text-secondary mb-3 block text-lg font-bold">
        관람 후기 ({totalCount})
      </strong>

      {/* 입력 영역 */}
      {isLoggedIn ? (
        <form onSubmit={handleSubmit} className="space-y-3">
          <textarea
            value={input}
            onChange={(e) => setInput(e.target.value)}
            placeholder="전시회 관람 후기를 남겨주세요..."
            rows={3}
            disabled={isSubmitting}
            className="text-secondary placeholder:text-secondary/40 focus:border-primary w-full resize-none rounded-xl border border-[#E8DFC8] bg-[#FAF7F2] px-4 py-3 text-sm focus:outline-none disabled:opacity-60"
          />
          <div className="flex justify-end">
            <button
              type="submit"
              disabled={!input.trim() || isSubmitting}
              className={cn(
                'rounded-xl px-5 py-2 text-sm font-semibold transition-colors',
                input.trim() && !isSubmitting
                  ? 'bg-primary text-white hover:bg-[#E09415]'
                  : 'bg-primary/40 cursor-not-allowed text-white'
              )}
            >
              {isSubmitting ? '등록중...' : '후기 등록'}
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
            const isMine = !!currentUserId && currentUserId === review.user_id;

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
                  <ReviewAlertDialog
                    isDeleting={deletingId === review.id}
                    onAction={() => handleDelete(review.id)}
                  />
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

      <ReviewPagination
        currentPage={currentPage}
        totalPages={totalPages}
        onPageChange={handlePageChange}
      />
    </section>
  );
}
