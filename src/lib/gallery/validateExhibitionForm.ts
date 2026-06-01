import { FormValidation } from '@/types/gallery';
import { GalleryTheme } from '@/lib/gallery/themes.config';

const VALID_THEMES: GalleryTheme[] = ['default', 'cherry', 'ocean', 'forest'];

export function validateExhibition(init: FormValidation) {
  const {
    title,
    description,
    thumbnailImg,
    startDateRaw,
    endDateRaw,
    guidelines,
    theme: themeRaw,
  } = init;

  if (typeof title !== 'string' || !title.trim()) {
    return { error: 'invalid title' };
  }

  if (typeof description !== 'string') {
    return { error: 'invalid description' };
  }
  if (guidelines !== null && typeof guidelines !== 'string') {
    return { error: 'invalid guidelines' };
  }

  if (thumbnailImg != null && !(thumbnailImg instanceof File)) {
    return { error: 'invalid image' };
  }

  if (typeof startDateRaw !== 'string') {
    return { error: 'invalid startDate' };
  }

  const start_date = new Date(startDateRaw);

  if (isNaN(start_date.getTime())) {
    return { error: 'invalid startDate' };
  }

  let end_date: Date | null = null;
  if (typeof endDateRaw === 'string') {
    end_date = new Date(endDateRaw);

    if (isNaN(end_date.getTime())) {
      return { error: 'invalid endDate' };
    }
  }
  if (end_date && end_date.getTime() < start_date.getTime()) {
    return { error: 'endDate must be after startDate' };
  }

  const theme: GalleryTheme =
    typeof themeRaw === 'string' && VALID_THEMES.includes(themeRaw as GalleryTheme)
      ? (themeRaw as GalleryTheme)
      : 'default';

  return {
    data: {
      title,
      description,
      thumbnailImg,
      start_date,
      end_date,
      guidelines,
      theme,
    },
  };
}
