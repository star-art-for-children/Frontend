export type ExhibitionStatus = 'ongoing' | 'upcoming' | 'ended';

// 한국 시간 기준 오늘 날짜 (YYYY-MM-DD)
export const todayKST = (): string => {
  return new Intl.DateTimeFormat('en-CA', {
    timeZone: 'Asia/Seoul',
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
  }).format(new Date());
};

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
