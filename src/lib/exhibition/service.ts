// 크레딧 부족(402) — 호출부에서 충전 안내로 분기하기 위한 클라이언트 전용 에러.
export class InsufficientCreditClientError extends Error {
  constructor() {
    super('INSUFFICIENT_CREDIT');
  }
}

export const postNewExhibition = async (formDate: FormData) => {
  const res = await fetch('/api/exhibitions', {
    method: 'POST',
    body: formDate,
  });

  if (res.status === 402) {
    throw new InsufficientCreditClientError();
  }
  if (!res.ok) {
    const error = await res.json();
    throw new Error(error.message);
  }
  const { createdId } = await res.json();

  return createdId;
};
export const getExhibitionDetails = async (id: string) => {
  const res = await fetch(`/api/exhibitions/${id}`);

  if (!res.ok) {
    const error = await res.json();
    throw new Error(error.message);
  }
  const { data } = await res.json();
  return {
    title: data?.title || '',
    host: data?.host || '',
    galleryPreset: data?.galleryPreset ?? null,
  };
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

export const endExhibition = async (exhibitionId: string) => {
  const res = await fetch(`/api/exhibitions/${exhibitionId}`, {
    method: 'PATCH',
    body: JSON.stringify({
      end_date: new Date(),
    }),
  });

  if (!res.ok) {
    const error = await res.json();
    throw new Error(error.message);
  }
  const { updatedId } = await res.json();

  return updatedId;
};
