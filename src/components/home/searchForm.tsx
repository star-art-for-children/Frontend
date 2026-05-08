'use client';

import { Search } from 'lucide-react';
import { useRouter, useSearchParams } from 'next/navigation';
import { useRef } from 'react';

export default function SearchForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const inputRef = useRef<HTMLInputElement>(null);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const params = new URLSearchParams(searchParams.toString());
    const value = inputRef.current?.value.trim() ?? '';

    if (value) {
      params.set('search', value);
    } else {
      params.delete('search');
    }

    params.delete('page');
    router.push(`/?${params.toString()}`, { scroll: false });
  };

  return (
    <form
      onSubmit={handleSubmit}
      role="search"
      className="mt-6 flex w-full max-w-xl items-center gap-3 rounded-xl bg-white p-5 shadow-[0_2px_12px_rgba(44,40,38,0.06)]"
    >
      <Search className="text-secondary/40 h-5 w-5 shrink-0" />
      <input
        ref={inputRef}
        defaultValue={searchParams.get('search') ?? ''}
        type="search"
        placeholder="전시회 이름, 교육기관 검색..."
        className="text-secondary placeholder:text-secondary/40 w-full bg-transparent text-sm focus:outline-none"
      />
    </form>
  );
}
