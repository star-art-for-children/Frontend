import crypto from 'crypto';
import { NextRequest, NextResponse } from 'next/server';
import { Resend } from 'resend';
import { sendOtpSchema } from '@/lib/schemas/auth';

const OTP_SECRET = process.env.OTP_SECRET!;

function generateOtp(): string {
  return crypto.randomInt(0, 100000000).toString().padStart(8, '0');
}

function hashOtp(otp: string): string {
  return crypto.createHmac('sha256', OTP_SECRET).update(otp).digest('hex');
}

function createOtpToken(email: string, otp: string): string {
  const expiresAt = Date.now() + 10 * 60 * 1000;
  const otpHash = hashOtp(otp);
  const payload = `${email}:${otpHash}:${expiresAt}`;
  const sig = crypto
    .createHmac('sha256', OTP_SECRET)
    .update(payload)
    .digest('hex');
  return Buffer.from(
    JSON.stringify({ email, otpHash, expiresAt, sig })
  ).toString('base64');
}

export async function POST(req: NextRequest) {
  const resend = new Resend(process.env.RESEND_API_KEY);
  const body = await req.json();
  const parsed = sendOtpSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json(
      { error: parsed.error.issues[0].message },
      { status: 400 }
    );
  }

  const { email } = parsed.data;

  const otp = generateOtp();
  const token = createOtpToken(email, otp);

  const { error } = await resend.emails.send({
    from: process.env.RESEND_FROM_EMAIL || 'onboarding@resend.dev',
    to: email,
    subject: '[스타아트] 이메일 인증번호',
    html: `
      <div style="font-family: sans-serif; max-width: 480px; margin: 0 auto;">
        <h2 style="color: #1a1a2e;">스타아트 이메일 인증</h2>
        <p>아래 인증번호를 입력해주세요. <strong>10분</strong> 이내에 유효합니다.</p>
        <div style="font-size: 32px; font-weight: bold; letter-spacing: 8px; color: #f5bc3e; padding: 24px; background: #faf7f2; border-radius: 12px; text-align: center;">
          ${otp}
        </div>
        <p style="color: #999; font-size: 13px; margin-top: 16px;">본인이 요청하지 않은 경우 이 메일을 무시해주세요.</p>
      </div>
    `,
  });

  if (error) {
    return NextResponse.json(
      { error: '이메일 발송에 실패했습니다.' },
      { status: 500 }
    );
  }

  const response = NextResponse.json({ success: true });
  response.cookies.set('otp_token', token, {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    maxAge: 10 * 60,
    path: '/',
    sameSite: 'lax',
  });

  return response;
}
