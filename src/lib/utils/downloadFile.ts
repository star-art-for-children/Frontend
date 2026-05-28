export const downloadFile = async (url: string, filename: string) => {
  const response = await fetch(url);
  if (!response.ok) throw new Error('download failed');
  const blob = await response.blob();
  const objectUrl = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.href = objectUrl;
  link.download = filename;
  link.click();
  URL.revokeObjectURL(objectUrl);
};
