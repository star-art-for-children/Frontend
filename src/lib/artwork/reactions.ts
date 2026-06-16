import { createClient } from '@/lib/supabase/server';

type SupabaseServerClient = Awaited<ReturnType<typeof createClient>>;

export type ArtworkReactionAggregate = {
  // 작품별 이모지 수: artworkId → { '❤️': 3, '😍': 1 }
  reactionsMap: Map<string, Record<string, number>>;
  // 작품별 내가 누른 이모지: artworkId → '❤️'
  myReactionMap: Map<string, string>;
};

// 여러 작품의 이모지 반응을 한 번에 집계한다.
// 전시 상세·내 작품·위시리스트 등 작품 목록이 있는 곳에서 공통으로 사용.
export async function fetchArtworkReactions(
  supabase: SupabaseServerClient,
  artworkIds: string[],
  currentUserId: string | null
): Promise<ArtworkReactionAggregate> {
  const reactionsMap = new Map<string, Record<string, number>>();
  const myReactionMap = new Map<string, string>();

  if (artworkIds.length === 0) {
    return { reactionsMap, myReactionMap };
  }

  const { data, error } = await supabase
    .from('artwork_reactions')
    .select('artwork_id, user_id, emoji')
    .in('artwork_id', artworkIds);

  // 반응은 부가 기능이므로 조회 실패 시 페이지 전체를 막지 않고
  // 빈 집계를 반환한다. (에러는 로깅하여 추적 가능하게)
  if (error) {
    console.error('artwork reactions 집계 실패:', error);
    return { reactionsMap, myReactionMap };
  }

  for (const row of data ?? []) {
    const counts = reactionsMap.get(row.artwork_id) ?? {};
    counts[row.emoji] = (counts[row.emoji] ?? 0) + 1;
    reactionsMap.set(row.artwork_id, counts);
    if (currentUserId && row.user_id === currentUserId) {
      myReactionMap.set(row.artwork_id, row.emoji);
    }
  }

  return { reactionsMap, myReactionMap };
}
