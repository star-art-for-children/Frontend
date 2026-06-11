'use client';

import { onboardingSchema } from '@/lib/schemas/auth';
import { AnimatePresence, motion } from 'framer-motion';
import { Building2, User } from 'lucide-react';
import { useRouter } from 'next/navigation';
import { useRef, useState } from 'react';

type UserType = 'general' | 'teacher';

type OnboardingFormFieldProps = {
  defaultName: string;
};

const OnboardingFormField = ({ defaultName }: OnboardingFormFieldProps) => {
  const router = useRouter();

  const [userType, setUserType] = useState<UserType>('general');
  const [name, setName] = useState(defaultName);
  const [organization, setOrganization] = useState('');
  const [purpose, setPurpose] = useState('');

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [fieldErrors, setFieldErrors] = useState<Record<string, string>>({});
  const submissionLockRef = useRef(false);

  const clearFieldError = (field: string) => {
    setFieldErrors((prev) => {
      if (!prev[field]) return prev;
      const next = { ...prev };
      delete next[field];
      return next;
    });
  };

  const handleSubmit = async () => {
    if (submissionLockRef.current || isSubmitting) return;
    setErrorMessage(null);

    const input = {
      role: userType,
      name,
      ...(userType === 'teacher' && { organization, purpose }),
    };

    const parsed = onboardingSchema.safeParse(input);
    if (!parsed.success) {
      const errors: Record<string, string> = {};
      for (const issue of parsed.error.issues) {
        const key = String(issue.path[0] ?? '');
        if (key && !errors[key]) errors[key] = issue.message;
      }
      setFieldErrors(errors);
      return;
    }

    setFieldErrors({});
    submissionLockRef.current = true;
    setIsSubmitting(true);

    let completed = false;
    try {
      const res = await fetch('/api/auth/onboarding', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(parsed.data),
      });

      if (!res.ok) {
        let message = '온보딩에 실패했습니다. 다시 시도해주세요.';
        try {
          const data = await res.json();
          if (typeof data?.error === 'string' && data.error.trim()) {
            message = data.error;
          }
        } catch {}
        setErrorMessage(message);
        return;
      }

      completed = true;
      router.replace('/');
      router.refresh();
    } catch {
      setErrorMessage(
        '네트워크 오류가 발생했습니다. 연결 상태를 확인한 뒤 다시 시도해주세요.'
      );
    } finally {
      if (!completed) {
        submissionLockRef.current = false;
        setIsSubmitting(false);
      }
    }
  };

  return (
    <div className="border-secondary/5 rounded-3xl border bg-white p-8 pb-9 shadow-[0px_20px_25px_0px_rgba(0,0,0,0.1),0px_8px_10px_0px_rgba(0,0,0,0.1)]">
      {/* Tab Switcher */}
      <div className="mb-6 flex rounded-2xl bg-[#faf7f2] p-1">
        <button
          type="button"
          onClick={() => setUserType('general')}
          className={`h-10 flex-1 rounded-[14px] text-[14px] font-medium transition-all ${
            userType === 'general'
              ? 'text-secondary bg-white shadow-[0px_1px_3px_0px_rgba(0,0,0,0.1),0px_1px_2px_0px_rgba(0,0,0,0.1)]'
              : 'text-secondary/50'
          }`}
        >
          👤 일반 사용자
        </button>
        <button
          type="button"
          onClick={() => setUserType('teacher')}
          className={`h-10 flex-1 rounded-[14px] text-[14px] font-medium transition-all ${
            userType === 'teacher'
              ? 'text-secondary bg-white shadow-[0px_1px_3px_0px_rgba(0,0,0,0.1),0px_1px_2px_0px_rgba(0,0,0,0.1)]'
              : 'text-secondary/50'
          }`}
        >
          🎨 선생님
        </button>
      </div>

      <div className="flex flex-col gap-6">
        <div className="flex flex-col">
          {/* 이름 */}
          <div className="flex flex-col gap-1.5">
            <label className="text-secondary text-[14px] font-medium">
              이름
            </label>
            <div className="relative">
              <div className="text-secondary/40 absolute top-1/2 left-3.5 -translate-y-1/2">
                <User className="h-3.75 w-3.75" />
              </div>
              <input
                type="text"
                value={name}
                onChange={(e) => {
                  setName(e.target.value);
                  clearFieldError('name');
                }}
                placeholder="이름을 입력하세요"
                className="border-secondary/5 text-secondary placeholder:text-secondary/30 focus:border-primary/40 focus:ring-primary/30 h-12.5 w-full rounded-[14px] border bg-[#faf7f2] pr-4 pl-10 text-[16px] transition-all outline-none focus:ring-2"
              />
            </div>
            {fieldErrors.name && (
              <p className="text-[12px] text-red-500">{fieldErrors.name}</p>
            )}
          </div>

          {/* 선생님 전용 필드 */}
          <AnimatePresence initial={false}>
            {userType === 'teacher' && (
              <motion.div
                key="teacher-fields"
                initial={{ opacity: 0, height: 0, marginTop: 0 }}
                animate={{ opacity: 1, height: 'auto', marginTop: '1.5rem' }}
                exit={{ opacity: 0, height: 0, marginTop: 0 }}
                transition={{ duration: 0.3, ease: 'easeInOut' }}
                className="flex flex-col gap-6 overflow-hidden"
              >
                {/* 교육기관명 */}
                <div className="flex flex-col gap-1.5">
                  <label className="text-secondary text-[14px] font-medium">
                    교육기관명
                  </label>
                  <div className="relative">
                    <div className="text-secondary/40 absolute top-1/2 left-3.5 -translate-y-1/2">
                      <Building2 className="h-3.75 w-3.75" />
                    </div>
                    <input
                      type="text"
                      value={organization}
                      onChange={(e) => {
                        setOrganization(e.target.value);
                        clearFieldError('organization');
                      }}
                      placeholder="학원 / 학교명"
                      className="border-secondary/5 text-secondary placeholder:text-secondary/30 focus:border-primary/40 focus:ring-primary/30 h-12.5 w-full rounded-[14px] border bg-[#faf7f2] pr-4 pl-10 text-[16px] transition-all outline-none focus:ring-2"
                    />
                  </div>
                  {fieldErrors.organization && (
                    <p className="text-[12px] text-red-500">
                      {fieldErrors.organization}
                    </p>
                  )}
                </div>

                {/* 사용 목적 */}
                <div className="flex flex-col gap-1.5">
                  <label className="text-secondary text-[14px] font-medium">
                    사용 목적
                  </label>
                  <textarea
                    value={purpose}
                    onChange={(e) => {
                      setPurpose(e.target.value);
                      clearFieldError('purpose');
                    }}
                    placeholder="사용 목적을 간략하게 작성해주세요"
                    rows={4}
                    className="border-secondary/5 text-secondary placeholder:text-secondary/30 focus:border-primary/40 focus:ring-primary/30 w-full resize-none rounded-[14px] border bg-[#faf7f2] px-4 py-3 text-[16px] leading-6 transition-all outline-none focus:ring-2"
                  />
                  {fieldErrors.purpose && (
                    <p className="text-[12px] text-red-500">
                      {fieldErrors.purpose}
                    </p>
                  )}
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>

        {errorMessage && (
          <p className="text-[14px] text-red-500">{errorMessage}</p>
        )}

        <button
          type="button"
          onClick={handleSubmit}
          disabled={isSubmitting}
          className="bg-primary h-13 w-full rounded-[14px] text-[16px] font-semibold text-white shadow-[0px_1px_3px_0px_rgba(0,0,0,0.1),0px_1px_2px_0px_rgba(0,0,0,0.1)] transition-all hover:bg-[#e5aa35] active:scale-[0.99] disabled:opacity-60"
        >
          {isSubmitting ? '처리 중...' : '시작하기'}
        </button>
      </div>
    </div>
  );
};

export default OnboardingFormField;
