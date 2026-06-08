'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Pencil } from 'lucide-react';
import { DialogTrigger } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import AppDialog from '@/components/shared/AppDialog';
import type { Profile } from '@/types/profile';

interface Props {
  profile: Profile;
}

export default function ProfileEditDialog({ profile }: Props) {
  const router = useRouter();
  const [open, setOpen] = useState(false);
  const [name, setName] = useState(profile.name);
  const [institution, setInstitution] = useState(
    profile.role === 'teacher' ? profile.academy_name : ''
  );
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  async function handleSubmit() {
    if (!name.trim()) {
      setError('이름을 입력해주세요.');
      return;
    }
    setError('');
    setLoading(true);

    const body: Record<string, string> = { name: name.trim() };
    if (profile.role === 'teacher') {
      body.institution = institution.trim();
    }

    try {
      const res = await fetch('/api/profile', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(body),
      });

      if (!res.ok) {
        const data = await res.json();
        setError(data.message ?? '저장에 실패했습니다.');
        return;
      }

      setOpen(false);
      router.refresh();
    } catch {
      setError('네트워크 오류가 발생했습니다.');
    } finally {
      setLoading(false);
    }
  }

  const trigger = (
    <DialogTrigger
      render={
        <button
          className="rounded-full p-1.5 text-[#a09a92] transition-colors hover:bg-[#f5efe6] hover:text-[#7a6e65]"
          aria-label="프로필 편집"
        />
      }
    >
      <Pencil size={15} />
    </DialogTrigger>
  );

  return (
    <AppDialog
      open={open}
      onOpenChange={setOpen}
      trigger={trigger}
      title="프로필 수정"
      className="max-w-sm"
    >
      <div className="space-y-3 py-1">
        <div>
          <label className="mb-1.5 block text-[13px] font-medium text-[#5a534c]">
            이름
          </label>
          <input
            type="text"
            value={name}
            onChange={(e) => setName(e.target.value)}
            className="w-full rounded-[12px] border border-[#e8e1d7] bg-[#faf7f2] px-4 py-2.5 text-[14px] text-[#26221f] outline-none focus:border-[#f1c792] focus:ring-2 focus:ring-[#f1c792]/30"
            placeholder="이름을 입력하세요"
          />
        </div>

        {profile.role === 'teacher' && (
          <div>
            <label className="mb-1.5 block text-[13px] font-medium text-[#5a534c]">
              학원명
            </label>
            <input
              type="text"
              value={institution}
              onChange={(e) => setInstitution(e.target.value)}
              className="w-full rounded-[12px] border border-[#e8e1d7] bg-[#faf7f2] px-4 py-2.5 text-[14px] text-[#26221f] outline-none focus:border-[#f1c792] focus:ring-2 focus:ring-[#f1c792]/30"
              placeholder="학원명을 입력하세요"
            />
          </div>
        )}

        {error && <p className="text-[12px] text-red-500">{error}</p>}
      </div>

      <div className="pt-3">
        <Button
          onClick={handleSubmit}
          disabled={loading}
          className="w-full rounded-[12px] bg-[#f0b63b] text-white hover:bg-[#e2a93a] disabled:opacity-60"
        >
          {loading ? '저장 중...' : '저장'}
        </Button>
      </div>
    </AppDialog>
  );
}
