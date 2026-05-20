import Image from 'next/image';
import Link from 'next/link';

const footerLinks = [
  {
    title: '서비스',
    links: [
      { label: '전체 전시회', href: '/' },
      { label: '회원가입', href: '/signup' },
    ],
  },
  {
    title: '안내',
    links: [
      { label: '서비스 소개', href: '/' },
      { label: '이용약관', href: '/' },
      { label: '문의하기', href: '/' },
    ],
  },
];

export default function Footer() {
  return (
    <footer className="bg-secondary text-white">
      <div className="mx-auto max-w-6xl px-3.5 py-12">
        <div className="flex flex-col justify-between gap-10 md:flex-row">
          <div className="max-w-sm">
            <Link href="/" className="flex items-center gap-2">
              <Image
                src="/images/logo.svg"
                alt="스타아트 로고"
                width={32}
                height={32}
              />
              <span className="text-lg font-bold text-white">스타아트</span>
            </Link>
            <p className="mt-4 text-sm leading-relaxed text-white/50">
              아이들의 창작물을 진지한 예술 작품으로,
              <br />
              온라인 3D 가상 전시회 플랫폼
            </p>
          </div>

          {/* 우측: 링크 섹션 */}
          <div className="flex gap-16">
            {footerLinks.map((section) => (
              <div key={section.title}>
                <strong className="text-sm font-semibold text-white/80">
                  {section.title}
                </strong>
                <ul className="mt-4 space-y-3">
                  {section.links.map((link) => (
                    <li key={link.label}>
                      <Link
                        href={link.href}
                        className="text-sm text-white/40 transition-colors hover:text-white"
                      >
                        {link.label}
                      </Link>
                    </li>
                  ))}
                </ul>
              </div>
            ))}
          </div>
        </div>
        <div className="mt-10 border-t border-white/10 pt-6 text-center">
          <p className="text-sm text-white/30">
            © 2026 StarArt (스타아트). All rights reserved.
          </p>
        </div>
      </div>
    </footer>
  );
}
