import { ExhibitionReviewItem } from '@/types/exhibition';

export interface ReviewsPage {
  reviews: ExhibitionReviewItem[];
  totalCount: number;
  totalPages: number;
}

// 리뷰 인터렉션 일어날 때마다 후기 목록 다시 받아옴 (pagination load)
export const fetchReviewsPage = async (
  exhibitionId: string,
  page: number
): Promise<ReviewsPage> => {
  const res = await fetch(
    `/api/exhibitions/${exhibitionId}/reviews?page=${page}`
  );
  if (!res.ok) {
    const error = await res.json().catch(() => ({}));
    throw new Error(error.message ?? '후기를 불러오지 못했습니다');
  }
  const { reviews, pagination } = await res.json();
  return {
    reviews,
    totalCount: pagination.totalCount,
    totalPages: pagination.totalPages,
  };
};

export const postReview = async (
  exhibitionId: string,
  content: string
): Promise<ExhibitionReviewItem> => {
  const res = await fetch(`/api/exhibitions/${exhibitionId}/reviews`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ content }),
  });

  if (!res.ok) {
    const error = await res.json().catch(() => ({}));
    throw new Error(error.message ?? '후기 등록에 실패했습니다');
  }

  const { review } = await res.json();
  return review;
};

export const deleteReview = async (
  exhibitionId: string,
  reviewId: string
): Promise<void> => {
  const res = await fetch(
    `/api/exhibitions/${exhibitionId}/reviews/${reviewId}`,
    { method: 'DELETE' }
  );

  if (!res.ok) {
    const error = await res.json().catch(() => ({}));
    throw new Error(error.message ?? '후기 삭제에 실패했습니다');
  }
};
