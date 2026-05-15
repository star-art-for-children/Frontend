export type ExhibitionStatus = 'ongoing' | 'upcoming' | 'ended';

export function getStatus(
  startDate: string,
  endDate?: string
): ExhibitionStatus {
  const now = Date.now();
  const start = new Date(startDate);
  const end = new Date(endDate ?? startDate);

  if (Number.isNaN(start.getTime()) || Number.isNaN(end.getTime())) {
    console.warn('Invalid date:', { startDate, endDate });
    return 'ended';
  }

  start.setHours(0, 0, 0, 0);
  end.setHours(23, 59, 59, 999);

  if (now < start.getTime()) return 'upcoming';
  if (!endDate) return 'ongoing';
  if (now > end.getTime()) return 'ended';
  return 'ongoing';
}

export const formatDate = (startDate: string, endDate?: string) => {
  return endDate ? `${startDate} ~ ${endDate}` : startDate;
};
