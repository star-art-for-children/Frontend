import { z } from 'zod';

export const profilePatchSchema = z.object({
  name: z.string().trim().min(1, '이름을 입력해주세요.'),
  institution: z.string().trim().optional(),
});
