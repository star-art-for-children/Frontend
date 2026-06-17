'use client';

import { cn } from '@/lib/utils';
import { CHARGE_UNIT, MIN_CHARGE, MAX_CHARGE } from '@/lib/schemas/payment';

const PRESETS = [1000, 5000, 10000, 30000, 50000, 100000];

type Props = {
  amount: number;
  onChange: (amount: number) => void;
};

export const AmountSelector = ({ amount, onChange }: Props) => {
  return (
    <div className="flex flex-col gap-3">
      <div className="grid grid-cols-2 gap-2 md:grid-cols-3">
        {PRESETS.map((v) => (
          <button
            key={v}
            type="button"
            onClick={() => onChange(v)}
            className={cn(
              'rounded-[14px] border px-4 py-3 text-[14px] font-semibold transition-colors',
              amount === v
                ? 'border-[#f09e72] bg-[#fff4ec] text-[#e07a45]'
                : 'border-[#e8e1d7] text-[#6b645c] hover:border-[#f1c792]'
            )}
          >
            {v.toLocaleString()}원
          </button>
        ))}
      </div>
      <input
        type="number"
        step={CHARGE_UNIT}
        min={MIN_CHARGE}
        max={MAX_CHARGE}
        value={amount || ''}
        onChange={(e) => onChange(Number(e.target.value))}
        placeholder={`${CHARGE_UNIT.toLocaleString()}원 단위 직접 입력`}
        className="rounded-[14px] border border-[#e8e1d7] px-4 py-3 text-[14px] text-[#2b2724] placeholder:text-[#b3aca3] focus:border-[#f1c792] focus:outline-none"
      />
    </div>
  );
};
