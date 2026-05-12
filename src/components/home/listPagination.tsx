import {
  Pagination,
  PaginationContent,
  PaginationEllipsis,
  PaginationItem,
  PaginationLink,
  PaginationNext,
  PaginationPrevious,
} from '@/components/ui/pagination';
import { EXHIBITIONS_PER_PAGE } from '@/lib/exhibition/constants';

interface PaginationProps {
  currentPage: number;
  totalCount: number;
  sort?: string;
  search?: string;
}

export default function ListPagination({
  currentPage,
  totalCount,
  sort,
  search,
}: PaginationProps) {
  const totalPages = Math.max(1, Math.ceil(totalCount / EXHIBITIONS_PER_PAGE));
  if (totalPages <= 1) return null;

  const makeHref = (page: number) => {
    const params = new URLSearchParams();
    if (sort && sort !== 'latest') params.set('sort', sort);
    if (search) params.set('search', search);
    if (page > 1) params.set('page', String(page));
    const queryString = params.toString();
    return queryString ? `/?${queryString}` : '/';
  };

  const start = Math.max(1, currentPage - 2);
  const end = Math.min(totalPages, currentPage + 2);
  const range = Array.from({ length: end - start + 1 }, (_, i) => start + i);

  return (
    <Pagination className="mt-10">
      <PaginationContent>
        {currentPage > 1 && (
          <PaginationItem>
            <PaginationPrevious href={makeHref(currentPage - 1)} />
          </PaginationItem>
        )}

        {start > 1 && (
          <>
            <PaginationItem>
              <PaginationLink href={makeHref(1)}>1</PaginationLink>
            </PaginationItem>
            {start > 2 && (
              <PaginationItem>
                <PaginationEllipsis />
              </PaginationItem>
            )}
          </>
        )}

        {range.map((p) => (
          <PaginationItem key={p}>
            <PaginationLink href={makeHref(p)} isActive={p === currentPage}>
              {p}
            </PaginationLink>
          </PaginationItem>
        ))}

        {end < totalPages && (
          <>
            {end < totalPages - 1 && (
              <PaginationItem>
                <PaginationEllipsis />
              </PaginationItem>
            )}
            <PaginationItem>
              <PaginationLink href={makeHref(totalPages)}>
                {totalPages}
              </PaginationLink>
            </PaginationItem>
          </>
        )}

        {currentPage < totalPages && (
          <PaginationItem>
            <PaginationNext href={makeHref(currentPage + 1)} />
          </PaginationItem>
        )}
      </PaginationContent>
    </Pagination>
  );
}
