import { redirect } from 'next/navigation';
import { createClient } from '@/lib/supabase/server';
import { getBalance } from '@/lib/payments/credit';
import { ChargeWidget } from '@/components/charge/ChargeWidget';

const ChargePage = async () => {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) redirect('/login');

  const balance = await getBalance(user.id);

  return (
    <main className="bg-[#f8f4ee] text-[#2d2926]">
      <div className="mx-auto w-full max-w-xl px-5 py-15 md:py-25">
        <header className="mb-6">
          <h1 className="text-[20px] font-bold text-[#2b2724]">크레딧 충전</h1>
          <p className="mt-1 text-[13px] text-[#827b73]">
            충전한 크레딧으로 AI 기능을 이용할 수 있어요
          </p>
        </header>

        <div className="rounded-[26px] border border-[#e8e1d7] bg-white px-7 py-6 shadow-[0_2px_8px_rgba(64,48,33,0.04)]">
          {/* 현재 잔액 — 카드 안쪽 인셋 패널 */}
          <div className="mb-5 flex items-center justify-between rounded-[16px] bg-[#faf7f1] px-5 py-4">
            <span className="text-[13px] text-[#827b73]">현재 잔액</span>
            <span className="text-[16px] font-bold text-[#2b2724]">
              {balance.toLocaleString()}
              <span className="ml-1 text-[12px] font-medium text-[#9b948c]">
                크레딧
              </span>
            </span>
          </div>
          <ChargeWidget customerKey={user.id} />
        </div>
      </div>
    </main>
  );
};

export default ChargePage;
