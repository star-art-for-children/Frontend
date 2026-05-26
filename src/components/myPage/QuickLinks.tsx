import Link from 'next/link';

// 반복되는 카드 UI를 배열로 선언해 항목 추가/수정 편리하게 만들기
const LINKS = [
  {
    href: '/artworks',
    icon: 'heart',
    iconBg: 'bg-[#fff4f5]',
    iconColor: '#ea8d8f',
    label: '내 작품 모아보기',
    sub: '등록된 나의 작품들을 확인하세요',
  },
  {
    href: '/wish-list',
    icon: 'book',
    iconBg: 'bg-[#fff8e8]',
    iconColor: '#e3b54a',
    label: '위시리스트',
    sub: '좋아하는 작품들을 모아보세요',
  },
] as const;

export default function QuickLinks() {
  return (
    <div className="grid gap-4 md:grid-cols-2">
      {LINKS.map((link) => (
        <Link
          key={link.href}
          href={link.href}
          className="group flex items-center gap-4 rounded-[20px] border border-[#e8e1d7] bg-white px-6 py-5 text-left shadow-[0_2px_8px_rgba(64,48,33,0.03)] transition-colors hover:border-[#f1c792]"
        >
          {/* 아이콘 배경색도 데이터로 같이 관리해서 카드 구조를 재사용. */}
          <div
            className={`flex h-11 w-11 shrink-0 items-center justify-center rounded-full ${link.iconBg}`}
          >
            {link.icon === 'heart' ? (
              <svg width="20" height="20" viewBox="0 0 20 20" fill="none">
                <path
                  d="M10 16.5s-5.75-3.42-5.75-8.02c0-1.98 1.56-3.48 3.45-3.48 1.18 0 2.21.57 2.93 1.55.72-.98 1.75-1.55 2.93-1.55 1.89 0 3.45 1.5 3.45 3.48 0 4.6-5.75 8.02-5.75 8.02Z"
                  stroke={link.iconColor}
                  strokeWidth="1.6"
                />
              </svg>
            ) : (
              <svg width="20" height="20" viewBox="0 0 20 20" fill="none">
                <path
                  d="M6 4.75h8A1.25 1.25 0 0115.25 6v8A1.25 1.25 0 0114 15.25H6A1.25 1.25 0 014.75 14V6A1.25 1.25 0 016 4.75Z"
                  stroke={link.iconColor}
                  strokeWidth="1.5"
                />
                <path
                  d="M7.5 4.75v10.5M12.5 8H9"
                  stroke={link.iconColor}
                  strokeWidth="1.5"
                  strokeLinecap="round"
                />
              </svg>
            )}
          </div>

          <div className="min-w-0 flex-1">
            <p className="mb-1 text-[14px] font-semibold text-[#26221f]">
              {link.label}
            </p>
            <p className="text-[12px] text-[#a09a92]">{link.sub}</p>
          </div>

          <svg
            width="14"
            height="14"
            viewBox="0 0 16 16"
            fill="none"
            className="shrink-0 text-[#c8c1b7] transition-colors group-hover:text-[#f09e72]"
          >
            <path
              d="M6 4l4 4-4 4"
              stroke="currentColor"
              strokeWidth="1.5"
              strokeLinecap="round"
            />
          </svg>
        </Link>
      ))}
    </div>
  );
}
