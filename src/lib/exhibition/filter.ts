import { ExhibitionProps, ExhibitionSort } from '@/types/exhibitionList';
import { getStatus } from './dateStatus';

interface FilterOptions {
  exhibitions: ExhibitionProps[];
  sort: ExhibitionSort;
  currentHost?: string;
}

export function filterAndSortExhibitions({
  exhibitions,
  sort,
  currentHost,
}: FilterOptions): ExhibitionProps[] {
  const ongoingOnly = exhibitions.filter(
    (e) => getStatus(e.startDate, e.endDate) === 'ongoing'
  );

  switch (sort) {
    case 'popular':
      return [...ongoingOnly].sort((a, b) => b.likes - a.likes);
    case 'oldest':
      return [...ongoingOnly].sort((a, b) =>
        a.startDate.localeCompare(b.startDate)
      );
    case 'upcoming':
      return exhibitions.filter(
        (e) => getStatus(e.startDate, e.endDate) === 'upcoming'
      );
    case 'ended':
      return exhibitions.filter(
        (e) => getStatus(e.startDate, e.endDate) === 'ended'
      );
    case 'mine':
      return exhibitions.filter((e) => e.host === currentHost);
    case 'latest':
    default:
      return [...ongoingOnly].sort((a, b) =>
        b.startDate.localeCompare(a.startDate)
      );
  }
}
