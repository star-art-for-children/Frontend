import Link from 'next/link';

interface CreditCardProps {
  balance: number;
}

export default function CreditCard({ balance }: CreditCardProps) {
  return (
    <section className="flex items-center gap-4 rounded-[20px] border border-[#e8e1d7] bg-white px-6 py-4 shadow-[0_2px_8px_rgba(64,48,33,0.03)]">
      {/* 아이콘 — QuickLinks 카드 아이콘과 동일한 44px 사이즈로 슬림하게 */}
      <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-full bg-gradient-to-br from-[#f5bf45] to-[#ff8f74]">
        <svg width="20" height="20" viewBox="0 0 24 24" fill="white">
          <path d="M12 3.5l2.4 4.9 5.4.8-3.9 3.8.9 5.4-4.8-2.5-4.8 2.5.9-5.4L4.2 9.2l5.4-.8L12 3.5Z" />
        </svg>
      </div>

      <div className="min-w-0 flex-1">
        <p className="text-[12px] text-[#a09a92]">보유 크레딧</p>
        <p className="text-[17px] font-bold text-[#2b2724]">
          {balance.toLocaleString()}
          <span className="ml-1 text-[12px] font-medium text-[#9b948c]">
            크레딧
          </span>
        </p>
      </div>

      <Link
        href="/charge"
        className="shrink-0 rounded-full bg-gradient-to-r from-[#f5bf45] to-[#ff8f74] px-4 py-2 text-[12px] font-semibold text-white shadow-[0_2px_8px_rgba(255,143,116,0.3)] transition-opacity hover:opacity-90"
      >
        충전하기
      </Link>
    </section>
  );
}
