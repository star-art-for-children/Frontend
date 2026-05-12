export const postNewExhibition = async (formDate: FormData) => {
  const res = await fetch('/api/exhibitions', {
    method: 'POST',
    body: formDate,
  });

  if (!res.ok) {
    const error = await res.json();
    throw new Error(error.message);
  }
  const { createdId } = await res.json();

  return createdId;
};

export const toggleExhibitionLike = async (
  exhibitionId: string,
  nextLiked: boolean
) => {
  const res = await fetch(`/api/exhibitions/${exhibitionId}/likes`, {
    method: nextLiked ? 'POST' : 'DELETE',
  });

  if (!res.ok) {
    const error = await res.json().catch(() => ({}));
    throw new Error(error.message ?? 'like error');
  }

  return res.json();
};
