import Link from 'next/link';
import { Calendar, Clock, Settings } from 'lucide-react';

interface ExhibitionUpcomingProps {
  id: string;
  title: string;
  host: string;
  startDate: string;
  isTeacher?: boolean;
}

export default function ExhibitionUpcoming({
  id,
  title,
  host,
  startDate,
  isTeacher = false,
}: ExhibitionUpcomingProps) {
  return (
    <section className="flex min-h-screen items-center justify-center px-3.5 py-20">
      <div className="flex flex-col items-center gap-4 text-center">
        <div className="bg-primary/10 mb-2 flex h-20 w-20 items-center justify-center rounded-2xl">
          <Clock className="text-primary h-10 w-10" />
        </div>

        <h2 className="text-secondary text-2xl font-bold">
          아직 공개되지 않은 미술전입니다
        </h2>
        <p className="text-secondary/70 text-sm font-semibold">{title}</p>
        <p className="text-secondary/50 text-sm">{host}</p>

        <span className="bg-primary/15 text-primary inline-flex items-center gap-1.5 rounded-full px-4 py-2 text-xs font-medium">
          <Calendar className="h-3.5 w-3.5" />
          {startDate}부터 관람 가능합니다
        </span>

        <div className="mt-6 flex w-full max-w-xs flex-col gap-3">
          {isTeacher && (
            <Link
              href={`/exhibitions/${id}/manage`}
              className="bg-secondary hover:bg-secondary/70 inline-flex items-center justify-center gap-2 rounded-xl px-8 py-3 text-sm font-semibold text-white shadow-lg transition-colors"
            >
              <Settings className="h-4 w-4" />
              전시회 관리하기
            </Link>
          )}
          <Link
            href="/"
            className="bg-primary inline-flex items-center justify-center rounded-xl px-8 py-3 text-sm font-semibold text-white shadow-lg transition-colors hover:bg-[#E09415]"
          >
            다른 전시 보러 가기
          </Link>
        </div>
      </div>
    </section>
  );
}
