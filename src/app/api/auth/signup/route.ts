import crypto from 'crypto';
import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';
import { signupRequestSchema } from '@/lib/schemas/auth';
import { getAuthErrorMessage } from '@/lib/supabase/authErrors';

const OTP_SECRET = process.env.OTP_SECRET!;

interface OtpToken {
  email: string;
  otpHash: string;
  expiresAt: number;
  sig: string;
}

function hashOtp(otp: string): string {
  return crypto.createHmac('sha256', OTP_SECRET).update(otp).digest('hex');
}

function verifyOtpToken(token: string, email: string, otp: string): boolean {
  try {
    const {
      email: te,
      otpHash,
      expiresAt,
      sig,
    }: OtpToken = JSON.parse(Buffer.from(token, 'base64').toString());

    if (te !== email) return false;
    if (Date.now() > expiresAt) return false;

    const payload = `${te}:${otpHash}:${expiresAt}`;
    const expected = crypto
      .createHmac('sha256', OTP_SECRET)
      .update(payload)
      .digest('hex');
    if (!crypto.timingSafeEqual(Buffer.from(sig), Buffer.from(expected)))
      return false;

    const inputHash = hashOtp(otp);
    return crypto.timingSafeEqual(Buffer.from(otpHash), Buffer.from(inputHash));
  } catch {
    return false;
  }
}

export async function POST(req: NextRequest) {
  let body: unknown;

  try {
    body = await req.json();
  } catch {
    return NextResponse.json(
      { error: '잘못된 요청 형식입니다.' },
      { status: 400 }
    );
  }

  const parsed = signupRequestSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json(
      { error: parsed.error.issues[0].message },
      { status: 400 }
    );
  }

  const { email, otp, password, name, role } = parsed.data;
  const organization =
    'organization' in parsed.data ? parsed.data.organization : undefined;
  const purpose = 'purpose' in parsed.data ? parsed.data.purpose : undefined;

  const token = req.cookies.get('otp_token')?.value;
  if (!token || !verifyOtpToken(token, email, otp)) {
    return NextResponse.json(
      { error: '인증번호가 올바르지 않거나 만료되었습니다.' },
      { status: 400 }
    );
  }

  if (
    !process.env.NEXT_PUBLIC_SUPABASE_URL ||
    !process.env.SUPABASE_SERVICE_ROLE_KEY
  ) {
    return NextResponse.json(
      { error: '서버 설정 오류: Supabase 키가 누락되었습니다.' },
      { status: 500 }
    );
  }

  const supabaseAdmin = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL,
    process.env.SUPABASE_SERVICE_ROLE_KEY,
    { auth: { autoRefreshToken: false, persistSession: false } }
  );

  const { error } = await supabaseAdmin.auth.admin.createUser({
    email,
    password,
    email_confirm: true,
    user_metadata: {
      username: name,
      role,
      institution: role === 'teacher' ? organization : null,
      purpose: role === 'teacher' ? purpose : null,
    },
  });

  if (error) {
    console.error('Supabase createUser error:', error);
    const code =
      'code' in error && typeof error.code === 'string' ? error.code : null;
    const message =
      code === 'email_exists' || code === 'user_already_exists'
        ? '이미 가입된 이메일입니다.'
        : getAuthErrorMessage(error);
    return NextResponse.json({ error: message, code }, { status: 400 });
  }

  const response = NextResponse.json({ success: true });
  response.cookies.delete('otp_token');
  return response;
}
