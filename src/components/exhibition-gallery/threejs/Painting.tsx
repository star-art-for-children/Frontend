import { Group, Texture } from 'three';
import { GalleryUIArtworkProps } from '../../../types/gallery';
import React from 'react';
import { Html } from '@react-three/drei';
import { Download, Heart } from 'lucide-react';
import { checkImgSize } from '@/lib/gallery/image';
export default function Painting({
  img,
  details,
  weight: w,
  height: h,
  paintingRef,
  htmlRef,
}: {
  img: Texture;
  details: GalleryUIArtworkProps;
  weight: number;
  height: number;
  paintingRef?: (mesh: Group | null) => void;
  htmlRef?: (el: HTMLDivElement | null) => void;
}) {
  const [imgW, imgH] = checkImgSize(img, w, h, 0.4);

  if (!details) return null;
  return (
    <group ref={paintingRef} position={[0, 0, 0.3]}>
      <mesh receiveShadow position={[0, 0, 0.03]}>
        <planeGeometry args={[imgW * 0.95, imgH * 0.95]} />
        <meshStandardMaterial map={img} />
      </mesh>
      <mesh castShadow receiveShadow>
        <boxGeometry args={[imgW, imgH, 0.05]} />
        <meshBasicMaterial color={'black'} />
      </mesh>
      <Html
        ref={htmlRef}
        transform
        position={[0, -h / 2 + 0.8, 0.13]}
        distanceFactor={2}
        center
        occlude
        style={{
          opacity: 0,
          pointerEvents: 'none',
          transition: 'opacity 0.4s ease, transform 0.4s ease',
          willChange: 'opacity, transform',
        }}
      >
        <div
          className={`gap flex max-w-100 min-w-80 flex-col gap-1 font-bold text-white`}
        >
          <h1 className={'text-[40px]'}>{details?.title}</h1>
          <h1 className={'text-[20px]'}>{details?.artist_name}</h1>
          <p className={'text-[15px] text-wrap text-gray-200'}>
            {details?.description}
          </p>
          <div className={'mt-1 flex justify-end gap-2 text-gray-200'}>
            <div className={'flex gap-1'}>
              <Heart fill={details?.likesByMe ? '#e68181' : 'none'} />
              <p>{details?.likes}</p>
            </div>
            <Download />
          </div>
        </div>
      </Html>
    </group>
  );
}
