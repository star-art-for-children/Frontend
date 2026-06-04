import { Texture } from 'three';

export function checkImgSize(
  img: Texture,
  w: number,
  h: number,
  offset: number
) {
  if (!img?.width || !img?.height || img.height === 0) {
    // console.warn('Invalid texture dimensions');
    return [w * offset, h * offset];
  }
  const imgAspect = img?.width / img?.height;

  const wallAspect = w / h;

  let imgW, imgH;

  if (imgAspect > wallAspect) {
    imgW = w * offset;
    imgH = imgW / imgAspect;
  } else {
    imgH = h * offset;
    imgW = imgH * imgAspect;
  }
  return [imgW, imgH];
}
