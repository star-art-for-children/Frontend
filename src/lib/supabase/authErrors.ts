import { AuthError } from '@supabase/supabase-js';

const AUTH_ERROR_CODE_MAP: Record<string, string> = {
  invalid_credentials: '이메일 또는 비밀번호가 올바르지 않습니다.',
  email_not_confirmed: '이메일 인증이 완료되지 않았습니다.',
  email_exists: '이미 가입된 이메일입니다.',
  user_already_exists: '이미 가입된 이메일입니다.',
  user_not_found: '존재하지 않는 사용자입니다.',
  signup_disabled: '회원가입이 비활성화되어 있습니다.',
  weak_password: '비밀번호가 너무 약합니다. 더 안전한 비밀번호를 입력해주세요.',
  same_password: '기존 비밀번호와 동일합니다.',
  validation_failed: '입력값을 확인해주세요.',
  email_address_invalid: '유효하지 않은 이메일 형식입니다.',
  email_address_not_authorized: '허용되지 않은 이메일 주소입니다.',
  otp_expired: '인증번호가 만료되었습니다. 다시 발송해주세요.',
  otp_disabled: 'OTP 인증이 비활성화되어 있습니다.',
  over_email_send_rate_limit:
    '이메일 발송 횟수를 초과했습니다. 잠시 후 다시 시도해주세요.',
  over_request_rate_limit: '요청이 너무 많습니다. 잠시 후 다시 시도해주세요.',
  over_sms_send_rate_limit:
    'SMS 발송 횟수를 초과했습니다. 잠시 후 다시 시도해주세요.',
  bad_jwt: '인증 토큰이 올바르지 않습니다.',
  session_expired: '세션이 만료되었습니다. 다시 로그인해주세요.',
  session_not_found: '세션을 찾을 수 없습니다. 다시 로그인해주세요.',
  token_expired: '토큰이 만료되었습니다.',
  captcha_failed: '캡차 인증에 실패했습니다.',
  provider_disabled: '해당 인증 방식이 비활성화되어 있습니다.',
  oauth_failed: 'OAuth 로그인에 실패했습니다. 다시 시도해주세요.',
  oauth_unknown: '알 수 없는 오류로 로그인하지 못했습니다. 다시 시도해주세요.',
  email_conflict:
    '이미 이메일/비밀번호로 가입된 계정입니다. 이메일로 로그인해주세요.',
  unexpected_failure:
    '예기치 않은 오류가 발생했습니다. 잠시 후 다시 시도해주세요.',
};

const AUTH_ERROR_MESSAGE_PATTERNS: Array<[RegExp, string]> = [
  [
    /token has expired or is invalid/i,
    '인증번호가 만료되었거나 올바르지 않습니다.',
  ],
  [/invalid login credentials/i, '이메일 또는 비밀번호가 올바르지 않습니다.'],
  [
    /user already (registered|exists)|email.*already|already.*email|duplicate/i,
    '이미 가입된 이메일입니다.',
  ],
  [
    /email rate limit exceeded/i,
    '이메일 발송 횟수를 초과했습니다. 잠시 후 다시 시도해주세요.',
  ],
  [/password should be at least/i, '비밀번호는 6자 이상이어야 합니다.'],
  [
    /email link is invalid or has expired/i,
    '인증 링크가 만료되었거나 올바르지 않습니다.',
  ],
  [/signups not allowed/i, '회원가입이 비활성화되어 있습니다.'],
  [/unable to validate email address/i, '유효하지 않은 이메일 형식입니다.'],
  [/network/i, '네트워크 오류가 발생했습니다. 연결을 확인해주세요.'],
];

export function getAuthErrorMessage(
  error: AuthError | { code?: string; message?: string } | null | undefined
): string {
  if (!error) return '알 수 없는 오류가 발생했습니다.';

  const code = 'code' in error ? error.code : undefined;
  if (code && AUTH_ERROR_CODE_MAP[code]) {
    return AUTH_ERROR_CODE_MAP[code];
  }

  const message = error.message ?? '';
  for (const [pattern, korean] of AUTH_ERROR_MESSAGE_PATTERNS) {
    if (pattern.test(message)) return korean;
  }

  return '오류가 발생했습니다. 잠시 후 다시 시도해주세요.';
}
