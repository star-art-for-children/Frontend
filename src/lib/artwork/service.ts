export async function postArtWorksByExhibitionId(
  id: string,
  formData: FormData
) {
  const res = await fetch(`/api/exhibitions/${id}/artworks`, {
    method: 'POST',
    body: formData,
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
