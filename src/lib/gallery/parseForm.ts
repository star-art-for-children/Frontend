export function parseFormDataToObj(formData: FormData) {
  return {
    title: formData.get('galleryName'),
    description: formData.get('galleryDesc'),
    thumbnailImg: formData.get('galleryImg'),
    startDateRaw: formData.get('startDate'),
    endDateRaw: formData.get('endDate'),
    guidelines: formData.get('guideLines'),
    galleryPreset: formData.get('galleryPreset'),
  };
}
