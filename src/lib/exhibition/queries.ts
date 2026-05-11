import { createClient } from '@/lib/supabase/server';
import { EXHIBITIONS_PER_PAGE } from '@/lib/exhibition/constants';
import { ExhibitionListItem, ExhibitionRow } from '@/types/exhibitionList';

// 한국 시간 기준 오늘 날짜 (YYYY-MM-DD)
const todayKST = (): string => {
  const kst = new Date(Date.now() + 9 * 60 * 60 * 1000);
  return kst.toISOString().slice(0, 10);
};

export class ExhibitionsAuthRequiredError extends Error {
  constructor() {
    super('no session');
    this.name = 'ExhibitionsAuthRequiredError';
  }
}

export type FetchExhibitionsParams = {
  page?: number;
  sort?: string | null;
  search?: string | null;
};

export type ExhibitionsPagination = {
  page: number;
  limit: number;
  totalCount: number;
  hasNextPage: boolean;
};

export async function fetchExhibitions({
  page = 1,
  sort,
  search,
}: FetchExhibitionsParams): Promise<{
  data: ExhibitionListItem[];
  pagination: ExhibitionsPagination;
}> {
  const supabase = await createClient();
  const today = todayKST();
  const limit = EXHIBITIONS_PER_PAGE;
  const safePage = Number.isFinite(page) && page > 0 ? page : 1;
  const from = (safePage - 1) * limit;
  const to = from + limit - 1;

  let query = supabase.from('exhibitions').select(
    `
      id,
      title,
      thumbnail_url,
      start_date,
      end_date,
      teacher_id,
      created_at,
      profile:profiles!teacher_id ( institution ),
      likes:exhibition_likes ( count )
    `,
    { count: 'exact' }
  );

  // 검색
  if (search) {
    const { data: matchedProfiles } = await supabase
      .from('profiles')
      .select('id')
      .ilike('institution', `%${search}%`);

    const matchedTeacherIds =
      matchedProfiles?.map((profile) => profile.id) || [];

    if (matchedTeacherIds.length > 0) {
      const idsString = `(${matchedTeacherIds.join(',')})`;
      query = query.or(`title.ilike.%${search}%,teacher_id.in.${idsString}`);
    } else {
      query = query.ilike('title', `%${search}%`);
    }
  }

  // 필터링
  switch (sort) {
    case 'oldest':
      query = query
        .lte('start_date', today)
        .or(`end_date.gte.${today},end_date.is.null`)
        .order('start_date', { ascending: true });
      break;
    case 'popular':
      query = query
        .lte('start_date', today)
        .or(`end_date.gte.${today},end_date.is.null`)
        .order('start_date', { ascending: false });
      break;
    case 'upcoming':
      query = query
        .gt('start_date', today)
        .order('start_date', { ascending: true });
      break;
    case 'ended':
      query = query
        .lt('end_date', today)
        .order('end_date', { ascending: false });
      break;
    case 'mine': {
      const {
        data: { user },
      } = await supabase.auth.getUser();
      if (!user) {
        throw new ExhibitionsAuthRequiredError();
      }
      query = query
        .eq('teacher_id', user.id)
        .order('created_at', { ascending: false });
      break;
    }

    case 'latest':
    default:
      query = query
        .lte('start_date', today)
        .or(`end_date.gte.${today},end_date.is.null`)
        .order('start_date', { ascending: false });
  }

  // TODO: popular 정렬은 추후 새로운 이슈에서 좋아요 작업할때 수정예정
  // (현재는 range를 건너뛰고 메모리 정렬 → 1000건 상한 및 페이지네이션 미동작)
  if (sort !== 'popular') {
    query = query.range(from, to);
  }

  const { data, error, count } = await query.returns<ExhibitionRow[]>();

  if (error) {
    if (error.code === 'PGRST103') {
      return {
        data: [],
        pagination: {
          page: safePage,
          limit,
          totalCount: 0,
          hasNextPage: false,
        },
      };
    }

    console.error(error);
    throw new Error('database error');
  }

  let result: ExhibitionListItem[] = (data ?? []).map((row) => {
    const profile = Array.isArray(row.profile) ? row.profile[0] : row.profile;

    return {
      id: row.id,
      title: row.title,
      host: profile?.institution ?? '',
      image: row.thumbnail_url,
      startDate: row.start_date,
      endDate: row.end_date,
      likes: row.likes?.[0]?.count ?? 0,
    };
  });

  // 인기순 재정렬
  if (sort === 'popular') {
    result = result.sort((a, b) => b.likes - a.likes);
  }

  const totalCount = count || 0;
  const hasNextPage = from + limit < totalCount;

  return {
    data: result,
    pagination: { page: safePage, limit, totalCount, hasNextPage },
  };
}
