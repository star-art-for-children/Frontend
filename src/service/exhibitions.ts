export const postNewExhibition = async (formDate: FormData) => {
  const res = await fetch('/api/exhibitions', {
    method: 'POST',
    body: formDate,
  });

  if (!res.ok) {
    const error = await res.json();
    throw new Error(error.message);
  }
  const { createdId } = await res.json();

  return createdId;
};
