import { getImageProps } from 'next/image';

export function optimizedTextureUrl(src: string): string {
  if (!src) return src;
  const { props } = getImageProps({
    src,
    alt: '',
    width: 1080,
    height: 1080,
    quality: 75,
  });
  const oneX = props.srcSet
    ?.split(',')
    .map((candidate) => candidate.trim())
    .find((candidate) => candidate.endsWith(' 1x'));
  return oneX ? oneX.slice(0, -' 1x'.length).trim() : props.src;
}
