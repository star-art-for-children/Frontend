'use client';

import OAuthButtons from '@/components/auth/OAuthButtons';
import { getAuthErrorMessage } from '@/lib/supabase/authErrors';
import { createClient } from '@/lib/supabase/client';
import { Eye, EyeOff, Lock, Mail } from 'lucide-react';
import { useRouter } from 'next/navigation';
import { useRef, useState } from 'react';

type LoginFormFieldProps = {
  initialError?: string;
};

const FormField = ({ initialError }: LoginFormFieldProps) => {
  const router = useRouter();
  const supabase = createClient();

  const [showPassword, setShowPassword] = useState(false);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(
    initialError ? getAuthErrorMessage({ code: initialError }) : null
  );
  const submissionLockRef = useRef(false);

  const handleLogin = async () => {
    if (submissionLockRef.current) return;

    setErrorMessage(null);

    if (!email || !password) {
      setErrorMessage('이메일과 비밀번호를 입력해주세요.');
      return;
    }

    submissionLockRef.current = true;
    setIsSubmitting(true);
    const { error } = await supabase.auth.signInWithPassword({
      email,
      password,
    });

    if (error) {
      submissionLockRef.current = false;
      setIsSubmitting(false);
      setErrorMessage(getAuthErrorMessage(error));
      return;
    }

    router.replace('/');
    router.refresh();
  };
  return (
    <>
      {/* 폼 */}
      <form
        className="flex flex-col gap-4"
        onSubmit={(e) => {
          e.preventDefault();
          handleLogin();
        }}
      >
        {/* 이메일 */}
        <div className="flex flex-col gap-2">
          <label className="text-secondary text-[14px] font-medium">
            이메일
          </label>
          <div className="relative">
            <div className="text-secondary/40 absolute top-1/2 left-3.5 -translate-y-1/2">
              <Mail className="h-4 w-4" />
            </div>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="example@email.com"
              className="border-secondary/5 text-secondary placeholder:text-secondary/30 focus:border-primary/40 focus:ring-primary/30 h-12.5 w-full rounded-[14px] border bg-[#faf7f2] pr-4 pl-10 text-[16px] transition-all outline-none focus:ring-2"
            />
          </div>
        </div>

        {/* 비밀번호 */}
        <div className="flex flex-col gap-2">
          <label className="text-secondary text-[14px] font-medium">
            비밀번호
          </label>
          <div className="relative">
            <div className="text-secondary/40 absolute top-1/2 left-3.5 -translate-y-1/2">
              <Lock className="h-4 w-4" />
            </div>
            <input
              type={showPassword ? 'text' : 'password'}
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="비밀번호를 입력하세요"
              className="border-secondary/5 text-secondary placeholder:text-secondary/30 focus:border-primary/40 focus:ring-primary/30 h-12.5 w-full rounded-[14px] border bg-[#faf7f2] pr-12 pl-10 text-[16px] transition-all outline-none focus:ring-2"
            />
            <button
              type="button"
              tabIndex={-1}
              onClick={() => setShowPassword(!showPassword)}
              className="text-secondary/40 hover:text-secondary/70 absolute top-1/2 right-3.5 -translate-y-1/2 transition-colors"
            >
              {showPassword ? (
                <EyeOff className="h-4 w-4" />
              ) : (
                <Eye className="h-4 w-4" />
              )}
            </button>
          </div>
        </div>

        {/* 에러 메시지 */}
        {errorMessage && (
          <p className="text-[14px] text-red-500">{errorMessage}</p>
        )}

        {/* 로그인 버튼 */}
        <button
          type="submit"
          disabled={isSubmitting}
          className="bg-primary mt-2 h-13 w-full rounded-[14px] text-[16px] font-semibold text-white shadow-[0px_1px_3px_0px_rgba(0,0,0,0.1),0px_1px_2px_0px_rgba(0,0,0,0.1)] transition-all hover:bg-[#e5aa35] active:scale-[0.99] disabled:opacity-60"
        >
          {isSubmitting ? '로그인 중...' : '로그인'}
        </button>
      </form>

      {/* OAuth 로그인 */}
      <OAuthButtons />
    </>
  );
};
export default FormField;
