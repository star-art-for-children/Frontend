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

  const { data } = await supabase
    .from('artwork_reactions')
    .select('artwork_id, user_id, emoji')
    .in('artwork_id', artworkIds);

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
