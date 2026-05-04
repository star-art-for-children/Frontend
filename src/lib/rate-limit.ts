import { Ratelimit } from '@upstash/ratelimit';
import { redis } from '@/lib/upstash';

export const otpEmailCooldownLimiter = new Ratelimit({
  redis,
  limiter: Ratelimit.fixedWindow(1, '60 s'),
  prefix: 'rl:otp:email:cooldown',
});

export const otpEmailWindowLimiter = new Ratelimit({
  redis,
  limiter: Ratelimit.fixedWindow(3, '10 m'),
  prefix: 'rl:otp:email:window',
});

export const otpIpWindowLimiter = new Ratelimit({
  redis,
  limiter: Ratelimit.fixedWindow(10, '10 m'),
  prefix: 'rl:otp:ip:window',
});
