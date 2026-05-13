import { Canvas } from '@react-three/fiber';
import { PointerLockControls, useProgress } from '@react-three/drei';
import React, { Dispatch, SetStateAction, useEffect, useMemo } from 'react';
import { GalleryUIArtworkProps } from '@/types/gallery';
import { createWalls, generateGalleryWalls } from '@/lib/gallery/createWalls';
import Room from '@/components/galleryExhibition/threejs/Room';
import Player from '@/components/galleryExhibition/threejs/Player';

export default function Scene2({
  exhibitionId,
  ready,
  init,
}: {
  exhibitionId: string;
  ready: Dispatch<SetStateAction<boolean>>;
  init: GalleryUIArtworkProps[];
}) {
  // console.log(init)
  const size = 21;
  const height = size * 0.3;
  const innerWalls = useMemo(() => generateGalleryWalls(size), [size]);
  const walls = useMemo(() => createWalls(size, height), [size, height]);

  const { active, loaded, total } = useProgress();

  useEffect(() => {
    ready(active === false && loaded === total && total > 0);
  }, [active, loaded, total, ready]);
  return (
    <>
      <Canvas shadows camera={{ fov: 50 }}>
        <Room
          exhibitionId={exhibitionId}
          walls={walls}
          innerWalls={innerWalls}
          init={init}
          size={size}
          height={height}
        />
        <ambientLight intensity={1} />

        <Player innerWalls={innerWalls} size={size} speed={3} />
        <PointerLockControls />
      </Canvas>
    </>
  );
}
