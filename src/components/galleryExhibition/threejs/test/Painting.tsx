import { Group, Texture } from 'three';
import { GalleryUIArtworkProps } from '../../../../types/gallery';
import React from 'react';
import { Html } from '@react-three/drei';
import { checkImgSize } from '@/components/galleryExhibition/threejs/test/util/util';
import { Download, Heart } from 'lucide-react';
export default function Painting({
  img,
  details,
  weight: w,
  height: h,
  paintingRef,
}: {
  img: Texture;
  details: GalleryUIArtworkProps;
  weight: number;
  height: number;
  paintingRef?: (mesh: Group | null) => void;
}) {
  const [imgW, imgH] = checkImgSize(img, w, h, 0.4);

  if (!details) return null;
  return (
    <group ref={paintingRef} position={[0, 0, 0.3]}>
      <mesh receiveShadow position={[0, 0, 0.03]}>
        <planeGeometry args={[imgW * 0.95, imgH * 0.9]} />
        <meshBasicMaterial map={img} />
      </mesh>
      <mesh castShadow receiveShadow>
        <boxGeometry args={[imgW, imgH, 0.05]} />
        <meshStandardMaterial color={'black'} />
      </mesh>
      <Html
        transform
        position={[0, -h / 2 + 0.8, 0.13]}
        distanceFactor={2}
        center
        occlude
        style={{
          transition: 'opacity 0.4s ease, transform 0.4s ease',
          willChange: 'opacity, transform',
        }}
      >
        <div className={'gap flex flex-col gap-1 font-bold text-white'}>
          <h1 className={'text-[45px]'}>{details?.title}</h1>
          <h1 className={'text-[25px]'}>{details?.artist_name}</h1>
          <p className={'text-[20px] text-wrap text-gray-200'}>
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
