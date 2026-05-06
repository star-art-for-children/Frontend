import Link from 'next/link';
import type { Exhibition } from '@/types/myPage';

interface ExhibitionListProps {
  exhibitions: Exhibition[];
}

export default function ExhibitionList({ exhibitions }: ExhibitionListProps) {
  return (
    <section className="overflow-hidden rounded-[24px] border border-[#e8e1d7] bg-white shadow-[0_2px_8px_rgba(64,48,33,0.03)]">
      <div className="flex items-center justify-between px-7 pt-6 pb-4">
        <div className="flex items-center gap-2">
          <svg width="15" height="15" viewBox="0 0 16 16" fill="none">
            <circle cx="8" cy="8" r="6.2" stroke="#8f877f" strokeWidth="1.2" />
            <path
              d="M5.5 8a2.5 2.5 0 005 0 2.5 2.5 0 00-5 0z"
              stroke="#8f877f"
              strokeWidth="1.2"
            />
            <path
              d="M8 5.5v1M8 9.5v1M5.5 8h-1M11.5 8h-1"
              stroke="#8f877f"
              strokeWidth="1.1"
              strokeLinecap="round"
            />
          </svg>
          <span className="text-[15px] font-bold text-[#26221f]">
            내가 운영하는 전시회
          </span>
        </div>
        <Link
          href="/dashboard/exhibitions/new"
          className="text-[12px] font-semibold text-[#e2ba50]"
        >
          + 새 전시회
        </Link>
      </div>

      <ul className="px-5 pb-5">
        {exhibitions.map((ex, idx) => (
          <li key={ex.id}>
            <Link
              href={`/dashboard/exhibitions/${ex.id}`}
              className={`flex items-center gap-4 rounded-[18px] px-3 py-3 transition-colors hover:bg-[#faf7f1] ${
                idx > 0 ? 'mt-1' : ''
              }`}
            >
              {ex.thumbnail?.startsWith('http') ? (
                // DB에서 받아온 실제 이미지 URL인 경우
                // eslint-disable-next-line @next/next/no-img-element
                <img
                  src={ex.thumbnail}
                  alt=""
                  className="h-11 w-11 shrink-0 rounded-[14px] object-cover"
                />
              ) : (
                // 이미지가 없는 경우 CSS 그라디언트로 대체
                <div
                  className={`h-11 w-11 shrink-0 rounded-[14px] ${thumbnailClassName(ex.thumbnail)}`}
                />
              )}

              <div className="min-w-0 flex-1">
                <p className="mb-1 text-[14px] font-semibold text-[#2b2724]">
                  {ex.title}
                </p>
                <p className="text-[12px] text-[#9b948c]">
                  {ex.artworkCount}점 ·{' '}
                  {ex.status === 'active' ? '진행중' : '종료'}
                </p>
              </div>

              <div className="flex items-center gap-3">
                <span
                  className={`rounded-full px-2.5 py-1 text-[11px] font-semibold ${
                    ex.status === 'active'
                      ? 'bg-[#ecfaf2] text-[#43b77a]'
                      : 'bg-[#f4f3f1] text-[#bbb3a8]'
                  }`}
                >
                  {ex.status === 'active' ? '진행중' : '종료'}
                </span>
                <svg width="14" height="14" viewBox="0 0 16 16" fill="none">
                  <path
                    d="M6 4l4 4-4 4"
                    stroke="#c3bcb2"
                    strokeWidth="1.5"
                    strokeLinecap="round"
                  />
                </svg>
              </div>
            </Link>
          </li>
        ))}
      </ul>
    </section>
  );
}

function thumbnailClassName(thumbnail: Exhibition['thumbnail']) {
  switch (thumbnail) {
    case 'sunset':
      return 'bg-[radial-gradient(circle_at_30%_30%,#f4c46a,transparent_30%),linear-gradient(135deg,#4c2d20,#9a5b38_55%,#f2aa6b)]';
    case 'abstract':
      return 'bg-[radial-gradient(circle_at_28%_30%,#f0d545,transparent_18%),radial-gradient(circle_at_70%_35%,#2b71c8,transparent_24%),radial-gradient(circle_at_48%_75%,#e46d34,transparent_22%),#6d8b1c]';
    case 'pastel':
      return 'bg-[linear-gradient(135deg,#f8d7b6,#f7efc9_45%,#d2e8f7)]';
    case 'nature':
      return 'bg-[linear-gradient(135deg,#764d2a,#efe4d0_45%,#8fb0ca)]';
    default:
      return 'bg-[#ece8e1]';
  }
}
