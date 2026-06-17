import { ExhibitionSchema } from '@/lib/schemas/exhibition';

export function validateExhibition(init: Record<string, unknown>) {
  const result = ExhibitionSchema.safeParse(init);

  if (!result.success) {
    return { error: result.error.issues[0].message };
  }

  const {
    title,
    description,
    thumbnailImg,
    startDateRaw,
    endDateRaw,
    guidelines,
    galleryPreset: gallery_preset,
  } = result.data;

  return {
    data: {
      title,
      description,
      thumbnailImg: thumbnailImg ?? null,
      start_date: new Date(startDateRaw),
      end_date: endDateRaw ? new Date(endDateRaw) : null,
      guidelines: guidelines ?? null,
      gallery_preset: gallery_preset ? JSON.parse(gallery_preset) : null,
    },
  };
}
