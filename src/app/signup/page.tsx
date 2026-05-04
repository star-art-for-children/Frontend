'use client';

export const dynamic = 'force-dynamic';

import { useRef, useState } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { AnimatePresence, motion } from 'framer-motion';
import {
  User,
  Mail,
  Lock,
  Eye,
  EyeOff,
  CheckCircle,
  Building2,
} from 'lucide-react';
import { createClient } from '@/lib/supabase/client';
import { getAuthErrorMessage } from '@/lib/supabase/authErrors';

type UserType = 'general' | 'teacher';

export default function SignupPage() {
  const router = useRouter();
  const supabase = createClient();

  const [userType, setUserType] = useState<UserType>('general');
  const [emailSent, setEmailSent] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [otp, setOtp] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [organization, setOrganization] = useState('');
  const [purpose, setPurpose] = useState('');

  const [isSendingOtp, setIsSendingOtp] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [infoMessage, setInfoMessage] = useState<string | null>(null);
  const submissionLockRef = useRef(false);

  const handleSendOtp = async () => {
    setErrorMessage(null);
    setInfoMessage(null);

    if (!email) {
      setErrorMessage('이메일을 입력해주세요.');
      return;
    }

    setIsSendingOtp(true);
    const res = await fetch('/api/auth/send-otp', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email }),
    });
    setIsSendingOtp(false);

    if (!res.ok) {
      const { error } = await res.json();
      setErrorMessage(error ?? '이메일 발송에 실패했습니다.');
      return;
    }

    setEmailSent(true);
    setInfoMessage('인증번호를 이메일로 발송했습니다.');
  };

  const handleSignup = async () => {
    if (submissionLockRef.current) return;

    setErrorMessage(null);
    setInfoMessage(null);

    if (!name.trim()) {
      setErrorMessage('이름을 입력해주세요.');
      return;
    }
    if (!emailSent) {
      setErrorMessage('이메일 인증을 먼저 진행해주세요.');
      return;
    }
    if (!otp || otp.length !== 8) {
      setErrorMessage('8자리 인증번호를 입력해주세요.');
      return;
    }
    if (password.length < 6) {
      setErrorMessage('비밀번호는 6자 이상이어야 합니다.');
      return;
    }
    if (password !== confirmPassword) {
      setErrorMessage('비밀번호가 일치하지 않습니다.');
      return;
    }
    if (userType === 'teacher' && !organization.trim()) {
      setErrorMessage('교육기관명을 입력해주세요.');
      return;
    }

    submissionLockRef.current = true;
    setIsSubmitting(true);

    const signupRes = await fetch('/api/auth/signup', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        email,
        otp,
        password,
        name,
        role: userType,
        organization,
        purpose,
      }),
    });

    if (!signupRes.ok) {
      submissionLockRef.current = false;
      setIsSubmitting(false);
      try {
        const { error } = await signupRes.json();
        setErrorMessage(error ?? '회원가입에 실패했습니다.');
      } catch {
        setErrorMessage('서버 오류가 발생했습니다. 잠시 후 다시 시도해주세요.');
      }
      return;
    }

    const { error: signInError } = await supabase.auth.signInWithPassword({
      email,
      password,
    });

    if (signInError) {
      submissionLockRef.current = false;
      setIsSubmitting(false);
      setErrorMessage(
        `가입은 완료됐으나 로그인에 실패했습니다. (${getAuthErrorMessage(signInError)}) 로그인 페이지에서 다시 시도해주세요.`
      );
      return;
    }

    router.replace('/');
    router.refresh();
  };

  return (
    <main className="flex min-h-screen flex-1 items-center justify-center bg-[#FAF7F2] px-4 pt-28 pb-12">
      <div className="w-full max-w-lg">
        {/* Logo + Title */}
        <div className="mb-8 flex flex-col items-center gap-3">
          <div className="flex items-center gap-3">
            <Image
              src="/images/logo.svg"
              alt="스타아트 로고"
              width={40}
              height={40}
            />
            <span className="text-secondary text-[20px] font-bold">
              스타아트
            </span>
          </div>
          <h1 className="text-secondary mt-2 text-[28px] font-bold">
            회원가입
          </h1>
          <p className="text-secondary/50 text-[14px]">
            계정 유형을 선택하고 가입해보세요
          </p>
        </div>

        {/* Form Card */}
        <div className="border-secondary/5 rounded-3xl border bg-white p-8 pb-9 shadow-[0px_20px_25px_0px_rgba(0,0,0,0.1),0px_8px_10px_0px_rgba(0,0,0,0.1)]">
          {/* Tab Switcher */}
          <div className="mb-6 flex rounded-2xl bg-[#faf7f2] p-1">
            <button
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

          {/* Form Fields */}
          <div className="flex flex-col gap-6">
            {/* 기본 필드 + 선생님 필드 컨테이너 */}
            <div className="flex flex-col">
              {/* 기본 필드 */}
              <div className="flex flex-col gap-6">
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
                      onChange={(e) => setName(e.target.value)}
                      placeholder="이름을 입력하세요"
                      className="border-secondary/5 text-secondary placeholder:text-secondary/30 focus:border-primary/40 focus:ring-primary/30 h-12.5 w-full rounded-[14px] border bg-[#faf7f2] pr-4 pl-10 text-[16px] transition-all outline-none focus:ring-2"
                    />
                  </div>
                </div>

                {/* 이메일 */}
                <div className="flex flex-col gap-1.5">
                  <label className="text-secondary text-[14px] font-medium">
                    이메일
                  </label>
                  <div className="flex gap-2">
                    <div className="relative flex-1">
                      <div className="text-secondary/40 absolute top-1/2 left-3.5 -translate-y-1/2">
                        <Mail className="h-3.75 w-3.75" />
                      </div>
                      <input
                        type="email"
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        placeholder="example@email.com"
                        className="border-secondary/5 text-secondary placeholder:text-secondary/30 focus:border-primary/40 focus:ring-primary/30 h-12.5 w-full rounded-[14px] border bg-[#faf7f2] pr-4 pl-10 text-[16px] transition-all outline-none focus:ring-2"
                      />
                    </div>
                    <button
                      type="button"
                      onClick={handleSendOtp}
                      disabled={isSendingOtp}
                      className="bg-primary/10 text-primary hover:bg-primary/20 h-12.5 rounded-[14px] px-4 text-[14px] font-medium whitespace-nowrap transition-colors disabled:opacity-60"
                    >
                      {isSendingOtp
                        ? '발송 중...'
                        : emailSent
                          ? '재발송'
                          : '인증발송'}
                    </button>
                  </div>
                </div>

                {/* 인증번호 */}
                {emailSent && (
                  <div className="flex flex-col gap-1.5">
                    <label className="text-secondary text-[14px] font-medium">
                      인증번호
                    </label>
                    <div className="flex items-center gap-2">
                      <input
                        type="text"
                        inputMode="numeric"
                        maxLength={8}
                        value={otp}
                        onChange={(e) =>
                          setOtp(e.target.value.replace(/\D/g, ''))
                        }
                        placeholder="인증번호 8자리 입력"
                        className="border-secondary/5 text-secondary placeholder:text-secondary/30 focus:border-primary/40 focus:ring-primary/30 h-12.5 flex-1 rounded-[14px] border bg-[#faf7f2] px-4 text-[16px] transition-all outline-none focus:ring-2"
                      />
                      <div className="flex shrink-0 items-center gap-1">
                        <CheckCircle className="h-3.5 w-3.5 text-[#00c950]" />
                        <span className="text-[14px] text-[#00c950]">
                          발송됨
                        </span>
                      </div>
                    </div>
                  </div>
                )}

                {/* 비밀번호 */}
                <div className="flex flex-col gap-1.5">
                  <label className="text-secondary text-[14px] font-medium">
                    비밀번호
                  </label>
                  <div className="relative">
                    <div className="text-secondary/40 absolute top-1/2 left-3.5 -translate-y-1/2">
                      <Lock className="h-3.75 w-3.75" />
                    </div>
                    <input
                      type={showPassword ? 'text' : 'password'}
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      placeholder="6자 이상"
                      className="border-secondary/5 text-secondary placeholder:text-secondary/30 focus:border-primary/40 focus:ring-primary/30 h-12.5 w-full rounded-[14px] border bg-[#faf7f2] pr-12 pl-10 text-[16px] transition-all outline-none focus:ring-2"
                    />
                    <button
                      type="button"
                      tabIndex={-1}
                      onClick={() => setShowPassword(!showPassword)}
                      className="text-secondary/40 hover:text-secondary/70 absolute top-1/2 right-3.5 -translate-y-1/2 transition-colors"
                    >
                      {showPassword ? (
                        <EyeOff className="h-3.75 w-3.75" />
                      ) : (
                        <Eye className="h-3.75 w-3.75" />
                      )}
                    </button>
                  </div>
                </div>

                {/* 비밀번호 확인 */}
                <div className="flex flex-col gap-1.5">
                  <label className="text-secondary text-[14px] font-medium">
                    비밀번호 확인
                  </label>
                  <div className="relative">
                    <div className="text-secondary/40 absolute top-1/2 left-3.5 -translate-y-1/2">
                      <Lock className="h-3.75 w-3.75" />
                    </div>
                    <input
                      type={showConfirmPassword ? 'text' : 'password'}
                      value={confirmPassword}
                      onChange={(e) => setConfirmPassword(e.target.value)}
                      placeholder="비밀번호 재입력"
                      className="border-secondary/5 text-secondary placeholder:text-secondary/30 focus:border-primary/40 focus:ring-primary/30 h-12.5 w-full rounded-[14px] border bg-[#faf7f2] pr-12 pl-10 text-[16px] transition-all outline-none focus:ring-2"
                    />
                    <button
                      type="button"
                      tabIndex={-1}
                      onClick={() =>
                        setShowConfirmPassword(!showConfirmPassword)
                      }
                      className="text-secondary/40 hover:text-secondary/70 absolute top-1/2 right-3.5 -translate-y-1/2 transition-colors"
                    >
                      {showConfirmPassword ? (
                        <EyeOff className="h-3.75 w-3.75" />
                      ) : (
                        <Eye className="h-3.75 w-3.75" />
                      )}
                    </button>
                  </div>
                </div>
              </div>

              {/* 선생님 전용 필드 */}
              <AnimatePresence initial={false}>
                {userType === 'teacher' && (
                  <motion.div
                    key="teacher-fields"
                    initial={{ opacity: 0, height: 0, marginTop: 0 }}
                    animate={{
                      opacity: 1,
                      height: 'auto',
                      marginTop: '1.5rem',
                    }}
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
                          onChange={(e) => setOrganization(e.target.value)}
                          placeholder="학원 / 학교명"
                          className="border-secondary/5 text-secondary placeholder:text-secondary/30 focus:border-primary/40 focus:ring-primary/30 h-12.5 w-full rounded-[14px] border bg-[#faf7f2] pr-4 pl-10 text-[16px] transition-all outline-none focus:ring-2"
                        />
                      </div>
                    </div>

                    {/* 사용 목적 */}
                    <div className="flex flex-col gap-1.5">
                      <label className="text-secondary text-[14px] font-medium">
                        사용 목적
                      </label>
                      <textarea
                        value={purpose}
                        onChange={(e) => setPurpose(e.target.value)}
                        placeholder="사용 목적을 간략하게 작성해주세요"
                        rows={4}
                        className="border-secondary/5 text-secondary placeholder:text-secondary/30 focus:border-primary/40 focus:ring-primary/30 w-full resize-none rounded-[14px] border bg-[#faf7f2] px-4 py-3 text-[16px] leading-6 transition-all outline-none focus:ring-2"
                      />
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>

            {/* 메시지 영역 */}
            {(errorMessage || infoMessage) && (
              <p
                className={`text-[14px] ${
                  errorMessage ? 'text-red-500' : 'text-[#00c950]'
                }`}
              >
                {errorMessage ?? infoMessage}
              </p>
            )}

            {/* 회원가입 버튼 */}
            <button
              type="button"
              onClick={handleSignup}
              disabled={isSubmitting}
              className="bg-primary h-13 w-full rounded-[14px] text-[16px] font-semibold text-white shadow-[0px_1px_3px_0px_rgba(0,0,0,0.1),0px_1px_2px_0px_rgba(0,0,0,0.1)] transition-all hover:bg-[#e5aa35] active:scale-[0.99] disabled:opacity-60"
            >
              {isSubmitting ? '처리 중...' : '회원가입 완료'}
            </button>

            {/* 로그인 링크 */}
            <p className="text-secondary/50 text-center text-[14px]">
              이미 계정이 있으신가요?{' '}
              <Link
                href="/login"
                className="text-primary font-medium hover:underline"
              >
                로그인
              </Link>
            </p>
          </div>
        </div>
      </div>
    </main>
  );
}
