import { z } from 'zod';

const str = (msg: string) =>
  z.preprocess(
    (v) => (typeof v === 'string' ? v : ''),
    z.string().min(1, msg)
  );

const trimStr = (msg: string) =>
  z.preprocess(
    (v) => (typeof v === 'string' ? v.trim() : ''),
    z.string().min(1, msg)
  );

const emailSchema = z.preprocess(
  (v) => (typeof v === 'string' ? v.trim() : ''),
  z
    .string()
    .min(1, '이메일을 입력해주세요.')
    .email({ error: '올바른 이메일 형식이 아닙니다.' })
);

const passwordSchema = z.preprocess(
  (v) => (typeof v === 'string' ? v : ''),
  z
    .string()
    .min(8, '비밀번호는 8자 이상이어야 합니다.')
    .regex(/[A-Za-z]/, '영문을 포함해야 합니다.')
    .regex(/[0-9]/, '숫자를 포함해야 합니다.')
    .regex(/[^A-Za-z0-9]/, '특수문자를 포함해야 합니다.')
);

const baseFields = {
  name: trimStr('이름을 입력해주세요.'),
  email: emailSchema,
  otp: z.preprocess(
    (v) => (typeof v === 'string' ? v.trim() : ''),
    z.string().regex(/^\d{8}$/, '8자리 인증번호를 입력해주세요.')
  ),
  password: passwordSchema,
};

const formOnlyFields = {
  confirmPassword: str('비밀번호 확인을 입력해주세요.'),
};

const generalRequestSchema = z.object({
  role: z.literal('general'),
  ...baseFields,
});

const teacherRequestSchema = z.object({
  role: z.literal('teacher'),
  ...baseFields,
  organization: trimStr('교육기관명을 입력해주세요.'),
  purpose: trimStr('가입 목적을 입력해주세요.'),
});

const generalFormSchema = generalRequestSchema.extend(formOnlyFields);

const teacherFormSchema = teacherRequestSchema.extend(formOnlyFields);

export const sendOtpSchema = z.object({
  email: emailSchema,
});

export const signupRequestSchema = z.discriminatedUnion('role', [
  generalRequestSchema,
  teacherRequestSchema,
]);

export const signupFormSchema = z
  .discriminatedUnion('role', [generalFormSchema, teacherFormSchema])
  .refine((d) => d.password === d.confirmPassword, {
    message: '비밀번호가 일치하지 않습니다.',
    path: ['confirmPassword'],
  });

export type SignupRequestInput = z.infer<typeof signupRequestSchema>;
export type SignupFormInput = z.infer<typeof signupFormSchema>;
