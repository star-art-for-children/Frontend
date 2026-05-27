import { fetchExhibitions } from '@/lib/exhibition/server';
import ExhibitionList from './ExhibitionList';
import ListPagination from './ListPagination';
import { ExhibitionSort } from '@/types/exhibition';
import { notFound } from 'next/navigation';

interface ExhibitionListContentProps {
  sort: ExhibitionSort;
  search?: string;
  page: number;
  userId?: string;
  isTeacher: boolean;
  isLoggedIn: boolean;
}

export default async function ExhibitionListContent({
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
