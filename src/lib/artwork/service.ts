export async function postArtWorksByExhibitionId(
  id: string,
  formData: FormData,
  signal?: AbortSignal
) {
  const res = await fetch(`/api/exhibitions/${id}/artworks`, {
    method: 'POST',
    body: formData,
    signal,
  });
  if (!res.ok) {
    const error = await res.json();
    throw new Error(error.message);
  }
  const { createdId } = await res.json();
  return createdId;
}
export async function getArtworksByExhibitionId(id: string) {
  const res = await fetch(`/api/exhibitions/${id}/artworks`);

  if (!res.ok) {
    const error = await res.json();
    throw new Error(error.message);
  }
  const result = await res.json();

  console.log(result);
  return result.artworks;
}
export async function putArtWorkByArtWorkId(
  exhibitionid: string,
  artworkId: string,
  formData: FormData
) {
  const res = await fetch(
    `/api/exhibitions/${exhibitionid}/artworks/${artworkId}`,
    {
      method: 'PUT',
      body: formData,
    }
  );
  if (!res.ok) {
    const error = await res.json();
    throw new Error(error.message);
  }
  const { createdId } = await res.json();
  return createdId;
}
export async function deleteArtworksByArtworkId(
  exhibitionid: string,
  artworkId: string
) {
  const res = await fetch(
    `/api/exhibitions/${exhibitionid}/artworks/${artworkId}`,
    {
      method: 'DELETE',
    }
  );
  if (!res.ok) {
    const error = await res.json();
    throw new Error(error.message);
  }
  const { deletedId } = await res.json();
  return deletedId;
}

export async function likesToggle(exhibitionId: string, closestId: string) {
  const result = await fetch(
    `/api/exhibitions/${exhibitionId}/artworks/${closestId}/likes`,
    { method: 'POST' }
  );

  if (!result.ok) {
    throw new Error('request failed');
  }

  return result.json();
}

// 스탬프 투어: 그림 발견 시 스탬프 수집 (insert-only)
export async function collectStamp(exhibitionId: string, artworkId: string) {
  const res = await fetch(
    `/api/exhibitions/${exhibitionId}/artworks/${artworkId}/stamp`,
    { method: 'POST' }
  );

  if (!res.ok) {
    throw new Error('request failed');
  }

  return res.json();
}

// 작품 이모지 반응 (4종)
export const REACTION_EMOJIS = ['❤️', '😍', '😮', '👏'] as const;

// 반응 토글: 같은 이모지 → 해제, 다른 이모지 → 교체. 응답의 emoji가 최종 상태
export async function toggleReaction(
  exhibitionId: string,
  artworkId: string,
  emoji: string
): Promise<{ emoji: string | null }> {
  const res = await fetch(
    `/api/exhibitions/${exhibitionId}/artworks/${artworkId}/reactions`,
    {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ emoji }),
    }
  );

  if (!res.ok) {
    throw new Error('request failed');
  }

  return res.json();
}

export const toggleArtworkLike = async (
  exhibitionId: string,
  artworkId: string,
  nextLiked: boolean
) => {
  const res = await fetch(
    `/api/exhibitions/${exhibitionId}/artworks/${artworkId}/likes`,
    {
      method: nextLiked ? 'POST' : 'DELETE',
    }
  );

  if (!res.ok) {
    const error = await res.json().catch(() => ({}));
    throw new Error(error.message ?? 'like error');
  }

  return res.json();
};
