import 'server-only';

import {
  ExhibitionReviewItem,
  ReviewRow,
  ReviewsPagination,
} from '@/types/exhibition';
import { createClient } from '../supabase/server';
import { REVIEWS_PER_PAGE } from './constants';

export async function fetchExhibitionReviews(
  exhibitionId: string,
  { page = 1, limit = REVIEWS_PER_PAGE }: { page: number; limit?: number }
): Promise<{ data: ExhibitionReviewItem[]; pagination: ReviewsPagination }> {
  const supabase = await createClient();
  const MAX_PAGE = 1000;
  const safePage = Number.isFinite(page)
    ? Math.min(MAX_PAGE, Math.max(1, Math.floor(page)))
    : 1;
  const from = (safePage - 1) * limit;
  const to = from + limit - 1;

  const { data, error, count } = await supabase
    .from('reviews')
    .select(
      'id, content, created_at, updated_at, user_id, profiles:user_id(username)',
      {
        count: 'exact',
      }
    )
    .eq('exhibition_id', exhibitionId)
    .order('created_at', { ascending: false })
    .range(from, to)
    .returns<ReviewRow[]>();

  if (error) {
    console.error(error);
    throw new Error('failed to fetch reviews');
  }

  const reviews = (data ?? []).map((row) => {
    const profiles = row.profiles as { username?: string } | null;
    return {
      id: row.id,
      content: row.content,
      createdAt: row.created_at,
      updatedAt: row.updated_at,
      userId: row.user_id,
      author: profiles?.username ?? '사용자',
    };
  });

  const totalCount = count ?? 0;
  const hasNextPage = from + limit < totalCount;

  return {
    data: reviews,
    pagination: { page: safePage, limit, totalCount, hasNextPage },
  };
}
