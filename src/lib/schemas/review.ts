import { z } from 'zod';

export const reviewCreateSchema = z.object({
  content: z
    .string()
    .trim()
    .min(1, '내용을 입력해주세요')
    .max(1000, '1000자 이하로 작성해주세요'),
});
