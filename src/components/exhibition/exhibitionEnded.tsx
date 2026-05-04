import Link from 'next/link';

interface ExhibitionEndedProps {
  title: string;
  endDate: string;
}

export default function ExhibitionEnded({
  title,
  endDate,
}: ExhibitionEndedProps) {
  return (
    <section className="flex min-h-screen items-center justify-center px-3.5 py-20">
      <div className="flex flex-col items-center gap-4 text-center">
        <div className="bg-primary/10 mb-2 flex h-20 w-20 items-center justify-center rounded-2xl text-5xl">
          🎭
        </div>

        <h2 className="text-secondary text-2xl font-bold">종료된 전시입니다</h2>
        <p className="text-secondary/60 text-sm">{title}</p>
        <p className="text-secondary/40 text-sm">
          이 전시회는 {endDate}에 종료되어 더 이상 관람할 수 없습니다.
        </p>

        <Link
          href="/"
          className="bg-primary mt-4 inline-flex items-center rounded-xl px-5 py-3 text-sm font-semibold text-white transition-colors hover:bg-[#E09415]"
        >
          다른 전시 보러 가기
        </Link>
      </div>
    </section>
  );
}
