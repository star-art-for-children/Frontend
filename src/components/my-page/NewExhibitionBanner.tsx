import { Palette } from 'lucide-react';
import Link from 'next/link';

export default function NewExhibitionBanner() {
  return (
    <section className="flex items-center justify-between rounded-[22px] bg-[linear-gradient(90deg,#f0b63b_0%,#ff8d73_100%)] px-5 py-5 shadow-[0_8px_18px_rgba(247,154,100,0.18)]">
      <div>
        <div className="mb-1.5 flex items-center gap-2">
          <Palette size={18} className="shrink-0 text-white" />
          <span className="text-[15px] font-bold text-white">
            새 전시회 만들기
          </span>
        </div>
        <p className="text-[13px] leading-snug text-white/80">
          아이들의 작품을 3D 갤러리에 전시해보세요
        </p>
      </div>

      <Link
        href="/exhibitions/create"
        className="shrink-0 rounded-[14px] bg-white px-5 py-2.5 text-[13px] font-bold text-[#d59d30] shadow-[0_2px_8px_rgba(255,255,255,0.32)]"
      >
        + 만들기
      </Link>
    </section>
  );
}
