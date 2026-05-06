import { redis } from '@/lib/upstash';

const OTP_EMAIL_COOLDOWN_PREFIX = 'rl:otp:email:cooldown';
const OTP_EMAIL_WINDOW_PREFIX = 'rl:otp:email:window';
const OTP_IP_WINDOW_PREFIX = 'rl:otp:ip:window';

const OTP_EMAIL_COOLDOWN_LIMIT = 1;
const OTP_EMAIL_COOLDOWN_WINDOW_MS = 60 * 1000;
const OTP_EMAIL_WINDOW_LIMIT = 3;
const OTP_EMAIL_WINDOW_MS = 10 * 60 * 1000;
const OTP_IP_WINDOW_LIMIT = 10;
const OTP_IP_WINDOW_MS = 10 * 60 * 1000;

const OTP_LIMIT_REASONS = {
  emailCooldown: 1,
  emailWindow: 2,
  ipWindow: 3,
} as const;

const consumeOtpLimitsScript = `
  local emailCooldownKey = KEYS[1]
  local emailWindowKey = KEYS[2]
  local ipWindowKey = KEYS[3]

  local emailCooldownLimit = tonumber(ARGV[1])
  local emailCooldownWindowMs = tonumber(ARGV[2])
  local emailCooldownReset = tonumber(ARGV[3])
  local emailWindowLimit = tonumber(ARGV[4])
  local emailWindowWindowMs = tonumber(ARGV[5])
  local emailWindowReset = tonumber(ARGV[6])
  local hasIp = tonumber(ARGV[7])
  local ipWindowLimit = tonumber(ARGV[8])
  local ipWindowWindowMs = tonumber(ARGV[9])
  local ipWindowReset = tonumber(ARGV[10])

  local emailCooldownCount = tonumber(redis.call("GET", emailCooldownKey) or "0")
  if emailCooldownCount >= emailCooldownLimit then
    return {0, ${OTP_LIMIT_REASONS.emailCooldown}, emailCooldownReset}
  end

  local emailWindowCount = tonumber(redis.call("GET", emailWindowKey) or "0")
  if emailWindowCount >= emailWindowLimit then
    return {0, ${OTP_LIMIT_REASONS.emailWindow}, emailWindowReset}
  end

  if hasIp == 1 then
    local ipWindowCount = tonumber(redis.call("GET", ipWindowKey) or "0")
    if ipWindowCount >= ipWindowLimit then
      return {0, ${OTP_LIMIT_REASONS.ipWindow}, ipWindowReset}
    end
  end

  local emailCooldownNext = redis.call("INCRBY", emailCooldownKey, 1)
  if emailCooldownNext == 1 then
    redis.call("PEXPIRE", emailCooldownKey, emailCooldownWindowMs)
  end

  local emailWindowNext = redis.call("INCRBY", emailWindowKey, 1)
  if emailWindowNext == 1 then
    redis.call("PEXPIRE", emailWindowKey, emailWindowWindowMs)
  end

  if hasIp == 1 then
    local ipWindowNext = redis.call("INCRBY", ipWindowKey, 1)
    if ipWindowNext == 1 then
      redis.call("PEXPIRE", ipWindowKey, ipWindowWindowMs)
    end
  end

  return {1, 0, 0}
`;

const refundOtpLimitsScript = `
  for _, key in ipairs(KEYS) do
    if key ~= "" then
      local current = tonumber(redis.call("GET", key) or "0")
      if current > 1 then
        redis.call("DECRBY", key, 1)
      elseif current == 1 then
        redis.call("DEL", key)
      end
    end
  end

  return 1
`;

type OtpLimitReason = 'emailCooldown' | 'emailWindow' | 'ipWindow';

type FixedWindowState = {
  key: string;
  reset: number;
  windowMs: number;
};

export type OtpLimitReservation = {
  emailCooldownKey: string;
  emailWindowKey: string;
  ipWindowKey: string | null;
};

type ConsumeOtpLimitsResult =
  | {
      success: true;
      reservation: OtpLimitReservation;
    }
  | {
      success: false;
      reason: OtpLimitReason;
      reset: number;
    };

function getFixedWindowState(
  prefix: string,
  identifier: string,
  windowMs: number,
  now: number
): FixedWindowState {
  const bucket = Math.floor(now / windowMs);

  return {
    key: `${prefix}:${identifier}:${bucket}`,
    reset: (bucket + 1) * windowMs,
    windowMs,
  };
}

function getOtpLimitReason(code: number): OtpLimitReason {
  switch (code) {
    case OTP_LIMIT_REASONS.emailCooldown:
      return 'emailCooldown';
    case OTP_LIMIT_REASONS.emailWindow:
      return 'emailWindow';
    case OTP_LIMIT_REASONS.ipWindow:
      return 'ipWindow';
    default:
      throw new Error(`Unknown OTP rate-limit reason: ${code}`);
  }
}

export async function consumeOtpLimits(
  email: string,
  clientIp: string | null
): Promise<ConsumeOtpLimitsResult> {
  const now = Date.now();
  const emailCooldown = getFixedWindowState(
    OTP_EMAIL_COOLDOWN_PREFIX,
    email,
    OTP_EMAIL_COOLDOWN_WINDOW_MS,
    now
  );
  const emailWindow = getFixedWindowState(
    OTP_EMAIL_WINDOW_PREFIX,
    email,
    OTP_EMAIL_WINDOW_MS,
    now
  );
  const ipWindow = clientIp
    ? getFixedWindowState(OTP_IP_WINDOW_PREFIX, clientIp, OTP_IP_WINDOW_MS, now)
    : null;

  const result = (await redis.eval<number[]>(
    consumeOtpLimitsScript,
    [emailCooldown.key, emailWindow.key, ipWindow?.key ?? ''],
    [
      OTP_EMAIL_COOLDOWN_LIMIT,
      emailCooldown.windowMs,
      emailCooldown.reset,
      OTP_EMAIL_WINDOW_LIMIT,
      emailWindow.windowMs,
      emailWindow.reset,
      clientIp ? 1 : 0,
      OTP_IP_WINDOW_LIMIT,
      ipWindow?.windowMs ?? 0,
      ipWindow?.reset ?? 0,
    ]
  )) as number[];

  if (result[0] === 1) {
    return {
      success: true,
      reservation: {
        emailCooldownKey: emailCooldown.key,
        emailWindowKey: emailWindow.key,
        ipWindowKey: ipWindow?.key ?? null,
      },
    };
  }

  return {
    success: false,
    reason: getOtpLimitReason(result[1]),
    reset: result[2],
  };
}

export async function refundOtpLimits(
  reservation: OtpLimitReservation
): Promise<void> {
  await redis.eval(
    refundOtpLimitsScript,
    [
      reservation.emailCooldownKey,
      reservation.emailWindowKey,
      reservation.ipWindowKey ?? '',
    ],
    []
  );
}
