import crypto from 'crypto';
import { NextRequest, NextResponse } from 'next/server';
import { Resend } from 'resend';
import { sendOtpSchema } from '@/lib/schemas/auth';

const OTP_SECRET = process.env.OTP_SECRET!;
const OTP_COOLDOWN_MS = 60 * 1000;
const OTP_EMAIL_WINDOW_MS = 10 * 60 * 1000;
const OTP_EMAIL_MAX_ATTEMPTS = 3;
const OTP_IP_WINDOW_MS = 10 * 60 * 1000;
const OTP_IP_MAX_ATTEMPTS = 10;

interface RateLimitRecord {
  attemptTimestamps: number[];
  lastAttemptAt: number;
}

interface RateLimitConfig {
  cooldownMs?: number;
  maxAttempts: number;
  windowMs: number;
}

interface RateLimitDecision {
  allowed: boolean;
  attemptTimestamps: number[];
  lastAttemptAt: number;
  retryAfterSeconds?: number;
}

const emailOtpRequests = new Map<string, RateLimitRecord>();
const ipOtpRequests = new Map<string, RateLimitRecord>();

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

function getClientIp(req: NextRequest): string | null {
  const forwardedFor = req.headers.get('x-forwarded-for');
  if (forwardedFor) {
    return forwardedFor.split(',')[0]?.trim() || null;
  }

  const realIp = req.headers.get('x-real-ip');
  return realIp?.trim() || null;
}

function evaluateRateLimit(
  store: Map<string, RateLimitRecord>,
  key: string,
  config: RateLimitConfig,
  now: number
): RateLimitDecision {
  const record = store.get(key);
  const attemptTimestamps =
    record?.attemptTimestamps.filter(
      (timestamp) => now - timestamp < config.windowMs
    ) ?? [];
  const lastAttemptAt = record?.lastAttemptAt ?? 0;

  if (
    config.cooldownMs &&
    lastAttemptAt > 0 &&
    now - lastAttemptAt < config.cooldownMs
  ) {
    return {
      allowed: false,
      attemptTimestamps,
      lastAttemptAt,
      retryAfterSeconds: Math.ceil(
        (config.cooldownMs - (now - lastAttemptAt)) / 1000
      ),
    };
  }

  if (attemptTimestamps.length >= config.maxAttempts) {
    const oldestAttempt = attemptTimestamps[0];

    return {
      allowed: false,
      attemptTimestamps,
      lastAttemptAt,
      retryAfterSeconds: Math.ceil(
        (config.windowMs - (now - oldestAttempt)) / 1000
      ),
    };
  }

  return {
    allowed: true,
    attemptTimestamps,
    lastAttemptAt,
  };
}

function persistRateLimitState(
  store: Map<string, RateLimitRecord>,
  key: string,
  decision: RateLimitDecision,
  now: number
) {
  store.set(key, {
    attemptTimestamps: [...decision.attemptTimestamps, now],
    lastAttemptAt: now,
  });
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

  const resend = new Resend(process.env.RESEND_API_KEY);
  const parsed = sendOtpSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json(
      { error: parsed.error.issues[0].message },
      { status: 400 }
    );
  }

  const { email } = parsed.data;
  const normalizedEmail = email.toLowerCase();
  const clientIp = getClientIp(req);
  const now = Date.now();

  const emailDecision = evaluateRateLimit(
    emailOtpRequests,
    normalizedEmail,
    {
      cooldownMs: OTP_COOLDOWN_MS,
      maxAttempts: OTP_EMAIL_MAX_ATTEMPTS,
      windowMs: OTP_EMAIL_WINDOW_MS,
    },
    now
  );

  if (!emailDecision.allowed) {
    return NextResponse.json(
      {
        error:
          emailDecision.attemptTimestamps.length >= OTP_EMAIL_MAX_ATTEMPTS
            ? '인증번호 요청 횟수를 초과했습니다. 잠시 후 다시 시도해주세요.'
            : '인증번호는 1분 뒤에 다시 요청할 수 있습니다.',
      },
      {
        status: 429,
        headers: {
          'Retry-After': String(emailDecision.retryAfterSeconds ?? 60),
        },
      }
    );
  }

  let ipDecision: RateLimitDecision | null = null;

  if (clientIp) {
    ipDecision = evaluateRateLimit(
      ipOtpRequests,
      clientIp,
      {
        maxAttempts: OTP_IP_MAX_ATTEMPTS,
        windowMs: OTP_IP_WINDOW_MS,
      },
      now
    );

    if (!ipDecision.allowed) {
      return NextResponse.json(
        { error: '요청이 너무 많습니다. 잠시 후 다시 시도해주세요.' },
        {
          status: 429,
          headers: {
            'Retry-After': String(ipDecision.retryAfterSeconds ?? 60),
          },
        }
      );
    }
  }

  persistRateLimitState(emailOtpRequests, normalizedEmail, emailDecision, now);
  if (clientIp && ipDecision) {
    persistRateLimitState(ipOtpRequests, clientIp, ipDecision, now);
  }

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
