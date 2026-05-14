import { FormValidation } from '@/types/gallery';

export function validateExhibition(init: FormValidation) {
  const {
    title,
    description,
    thumbnailImg,
    startDateRaw,
    endDateRaw,
    guidelines,
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

  return {
    data: {
      title,
      description,
      thumbnailImg,
      start_date,
      end_date,
      guidelines,
    },
  };
}
