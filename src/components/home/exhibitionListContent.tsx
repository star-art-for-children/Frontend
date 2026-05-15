import { fetchExhibitions } from '@/lib/exhibition/queries';
import ExhibitionList from './exhibitionList';
import ListPagination from './listPagination';
import { ExhibitionSort } from '@/types/exhibitionList';
import { notFound } from 'next/navigation';

interface ExhibitionListContentProps {
  sort: ExhibitionSort;
  search?: string;
  page: number;
  userId?: string;
  isTeacher: boolean;
  isLoggedIn: boolean;
}

export async function ExhibitionListContent({
  sort,
  search,
  page,
  userId,
  isTeacher,
  isLoggedIn,
}: ExhibitionListContentProps) {
  const { data: exhibitions, pagination } = await fetchExhibitions({
    sort,
    search,
    page,
    userId,
  });

  if (page > 1 && exhibitions.length === 0) return notFound();
  return (
    <>
      <ExhibitionList
        exhibitions={exhibitions}
        sort={sort}
        isTeacher={isTeacher}
        isLoggedIn={isLoggedIn}
      />
      <ListPagination
        currentPage={pagination.page}
        totalCount={pagination.totalCount}
        sort={sort}
        search={search}
      />
    </>
  );
}
