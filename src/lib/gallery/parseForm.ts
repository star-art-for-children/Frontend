export function parseFormDataToObj(formData: FormData) {
  const body = formData;
  const galleryImg = body.get('galleryImg');
  const galleryName = body.get('galleryName');
  const galleryDesc = body.get('galleryDesc');
  const guideLines = body.get('guideLines');
  const startDate = body.get('startDate');
  const endDate = body.get('endDate');

  return {
    title: galleryName,
    description: galleryDesc,
    thumbnailImg: galleryImg,
    startDateRaw: startDate,
    endDateRaw: endDate,
    guidelines: guideLines,
  };
}
