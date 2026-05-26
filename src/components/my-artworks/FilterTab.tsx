'use client';

import { cn } from '@/lib/utils';
import { FilterType } from './Types';

interface FilterTabProps {
  value: FilterType;
  onChange: (v: FilterType) => void;
}

const FILTERS: { key: FilterType; label: string }[] = [
  { key: 'latest', label: '최신순' },
  { key: 'oldest', label: '오래된 순' },
  { key: 'popular', label: '인기순' },
];

export default function FilterTab({ value, onChange }: FilterTabProps) {
  return (
    <div className="mb-6 flex items-center gap-2">
      {FILTERS.map((f) => (
        <button
          key={f.key}
          onClick={() => onChange(f.key)}
          className={cn(
            'rounded-full px-4 py-2 text-sm font-medium transition-colors',
            value === f.key
              ? 'bg-primary text-primary-foreground'
              : 'text-secondary/60 hover:bg-primary/10 hover:text-secondary bg-white'
          )}
        >
          {f.label}
        </button>
      ))}
    </div>
  );
}
