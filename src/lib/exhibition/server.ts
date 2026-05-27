import 'server-only';

import { createClient } from '@/lib/supabase/server';
import {
  ArtworkRow,
  ExhibitionDetailRow,
  ExhibitionListItem,
  ExhibitionRow,
} from '@/types/exhibition';
import { todayKST } from './dateStatus';
import { EXHIBITIONS_PER_PAGE } from './constants';

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
  userId?: string;
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
  userId,
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
      likes_count,
      profile:profiles!teacher_id ( institution )
    `,
    { count: 'exact' }
  );

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

  switch (sort) {
    case 'oldest':
      query = query
        .lte('start_date', today)
        .or(`end_date.gte.${today},end_date.is.null`)
        .order('start_date', { ascending: true })
        .order('created_at', { ascending: true });
      break;
    case 'popular':
      query = query
        .lte('start_date', today)
        .or(`end_date.gte.${today},end_date.is.null`)
        .order('likes_count', { ascending: false })
        .order('start_date', { ascending: false })
        .order('created_at', { ascending: false });
      break;
    case 'upcoming':
      query = query
        .gt('start_date', today)
        .order('start_date', { ascending: true })
        .order('created_at', { ascending: true });
      break;
    case 'ended':
      query = query
        .lt('end_date', today)
        .order('end_date', { ascending: false })
        .order('created_at', { ascending: false });
      break;
    case 'mine': {
      if (!userId) {
        throw new ExhibitionsAuthRequiredError();
      }
      query = query
        .eq('teacher_id', userId)
        .order('created_at', { ascending: false });
      break;
    }
    case 'latest':
    default:
      query = query
        .lte('start_date', today)
        .or(`end_date.gte.${today},end_date.is.null`)
        .order('start_date', { ascending: false })
        .order('created_at', { ascending: false });
  }

  query = query.range(from, to);

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

  let likedIds = new Set<string>();

  if (userId && data && data.length > 0) {
    const exhibitionIds = data.map((row) => row.id);
    const { data: likedRows } = await supabase
      .from('exhibition_likes')
      .select('exhibition_id')
      .eq('user_id', userId)
      .in('exhibition_id', exhibitionIds);

    likedIds = new Set((likedRows ?? []).map((r) => r.exhibition_id));
  }

  const result: ExhibitionListItem[] = (data ?? []).map((row) => {
    const profile = Array.isArray(row.profile) ? row.profile[0] : row.profile;
    return {
      id: row.id,
      title: row.title,
      host: profile?.institution ?? '',
      image: row.thumbnail_url,
      startDate: row.start_date,
      endDate: row.end_date,
      likes: row.likes_count,
      liked: likedIds.has(row.id),
    };
  });

  const totalCount = count || 0;
  const hasNextPage = from + limit < totalCount;

  return {
    data: result,
    pagination: { page: safePage, limit, totalCount, hasNextPage },
  };
}

export type ExhibitionWorkItem = {
  id: string;
  title: string;
  artist: string;
  image: string;
  description: string | null;
  likes: number;
  liked: boolean;
};

export type ExhibitionDetailItem = {
  id: string;
  title: string;
  image: string | null;
  startDate: string;
  endDate: string | null;
  description: string | null;
  host: string;
  totalLikes: number;
  isLiked: boolean;
  isOwner: boolean;
  isLoggedIn: boolean;
  currentUserId: string | null;
  works: ExhibitionWorkItem[];
};

export async function fetchExhibitionDetail(
  exhibitionId: string
): Promise<ExhibitionDetailItem | null> {
  const supabase = await createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();
  const currentUserId = user?.id ?? null;

  const { data: rawData, error } = await supabase
    .from('exhibitions')
    .select(
      `
      id,
      title,
      thumbnail_url,
      start_date,
      end_date,
      description,
      teacher_id,
      likes_count,
      profile:profiles!teacher_id ( institution ),
      artworks ( id, title, artist_name, description, image_url )
    `
    )
    .eq('id', exhibitionId)
    .single<ExhibitionDetailRow>();

  if (error) {
    if (error.code === 'PGRST116') return null;
    console.error('전시회 상세 조회 에러:', error);
    throw new Error('database error');
  }
  if (!rawData) return null;

  // 전시회에 대한 좋아요 여부
  let isLiked = false;
  if (currentUserId) {
    const { data: likeData } = await supabase
      .from('exhibition_likes')
      .select('id')
      .eq('exhibition_id', exhibitionId)
      .eq('user_id', currentUserId)
      .maybeSingle();
    isLiked = !!likeData;
  }

  // 작품에 대한 liked
  const artworkIds = (rawData.artworks ?? []).map((row) => row.id);
  const likesCountMap = new Map<string, number>();
  const likedArtworkIds = new Set<string>();

  if (artworkIds.length > 0) {
    const { data: allLikes } = await supabase
      .from('artwork_likes')
      .select('artwork_id, user_id')
      .in('artwork_id', artworkIds);

    for (const row of allLikes ?? []) {
      likesCountMap.set(
        row.artwork_id,
        (likesCountMap.get(row.artwork_id) ?? 0) + 1
      );
      if (currentUserId && row.user_id === currentUserId) {
        likedArtworkIds.add(row.artwork_id);
      }
    }
  }

  const profile = Array.isArray(rawData.profile)
    ? rawData.profile[0]
    : rawData.profile;

  return {
    id: rawData.id,
    title: rawData.title,
    image: rawData.thumbnail_url,
    startDate: rawData.start_date,
    endDate: rawData.end_date,
    description: rawData.description,
    host: profile?.institution ?? '',
    totalLikes: rawData.likes_count,
    isLiked,
    isOwner: rawData.teacher_id === currentUserId,
    isLoggedIn: !!currentUserId,
    currentUserId,
    works: (rawData.artworks ?? []).map((work: ArtworkRow) => ({
      id: work.id,
      title: work.title,
      artist: work.artist_name,
      image: work.image_url,
      description: work.description,
      likes: likesCountMap.get(work.id) ?? 0,
      liked: likedArtworkIds.has(work.id),
    })),
  };
}
