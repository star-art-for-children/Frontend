import { EXHIBITIONS_PER_PAGE } from '@/lib/exhibition/constants';

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

export const getExhibitions = async ({
  page = 1,
  sort = 'latest',
  search = '',
}: {
  page?: number;
  sort?: string;
  search?: string;
} = {}) => {
  const { cookies } = await import('next/headers');
  const cookieStore = await cookies();
  const baseUrl = process.env.NEXT_PUBLIC_BASE_URL ?? 'http://localhost:3000';

  const params = new URLSearchParams({
    page: page.toString(),
    sort: sort || 'latest',
    limit: String(EXHIBITIONS_PER_PAGE),
  });

  if (search) params.append('search', search);

  const res = await fetch(`${baseUrl}/api/exhibitions?${params.toString()}`, {
    cache: 'no-store',
    headers: {
      Cookie: cookieStore.toString(),
    },
  });

  const data = await res.json();

  if (!res.ok) throw new Error(data.message ?? 'unknown error');

  return {
    item: data.data ?? [],
    pagination: data.pagination ?? {
      page: 1,
      totalCount: 0,
      hasNextPage: false,
    },
  };
};
