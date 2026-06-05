import { z } from 'zod';

export const ExhibitionSchema = z
  .object({
    title: z.string().trim().min(1, 'invalid title'),
    description: z.string(),
    thumbnailImg: z.instanceof(File).nullable().optional(),
    startDateRaw: z.string().date('invalid startDate'),
    endDateRaw: z.string().date('invalid endDate').nullable().optional(),
    guidelines: z.string().nullable().optional(),
    galleryPreset: z
      .string()
      .nullable()
      .optional()
      .refine(
        (val) => {
          if (!val) return true;
          try {
            JSON.parse(val);
            return true;
          } catch {
            return false;
          }
        },
        { message: 'invalid gallery preset format' }
      ),
  })
  .refine(
    (data) =>
      !data.endDateRaw ||
      !data.startDateRaw ||
      data.endDateRaw >= data.startDateRaw,
    { message: 'endDate must be after startDate' }
  );
