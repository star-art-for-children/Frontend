export type ExhibitionStatus = 'ongoing' | 'upcoming' | 'ended';

const KST_OFFSET_MS = 9 * 60 * 60 * 1000;

// 한국 시간 기준 오늘 날짜 (YYYY-MM-DD)
export const todayKST = (): string => {
  return new Intl.DateTimeFormat('en-CA', {
    timeZone: 'Asia/Seoul',
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
  }).format(new Date());
};

const getKSTBoundaryTime = (
  date: string,
  boundary: 'start' | 'end'
): number => {
  const match = /^(\d{4})-(\d{2})-(\d{2})$/.exec(date);
  if (!match) return Number.NaN;

  const [, year, month, day] = match;
  const utcMidnight = Date.UTC(Number(year), Number(month) - 1, Number(day));

  if (boundary === 'start') {
    return utcMidnight - KST_OFFSET_MS;
  }

  return utcMidnight + (24 * 60 * 60 * 1000 - KST_OFFSET_MS) - 1;
};

export function getStatus(
  startDate: string,
  endDate?: string | null,
  endedAt?: string | null
): ExhibitionStatus {
  const now = Date.now();

  // 즉시 종료(ended_at)가 설정되어 그 시각이 지났으면 최우선으로 ended.
  if (endedAt) {
    const ended = new Date(endedAt).getTime();
    if (!Number.isNaN(ended) && now >= ended) return 'ended';
  }

  const start = getKSTBoundaryTime(startDate, 'start');
  const end = getKSTBoundaryTime(endDate ?? startDate, 'end');

  if (Number.isNaN(start) || Number.isNaN(end)) {
    console.warn('Invalid date:', { startDate, endDate });
    return 'ended';
  }

  if (now < start) return 'upcoming';
  if (!endDate) return 'ongoing';
  if (now > end) return 'ended';
  return 'ongoing';
}

export const formatDate = (startDate: string, endDate?: string) => {
  return endDate ? `${startDate} ~ ${endDate}` : startDate;
};
