import { Canvas } from '@react-three/fiber';
import { PointerLockControls, useProgress } from '@react-three/drei';
import React, { Dispatch, SetStateAction, useEffect, useMemo } from 'react';
import Room from '@/components/galleryExhibition/threejs/test/Room';

import Player from '@/components/galleryExhibition/threejs/test/Player';
import {
  createWalls,
  generateGalleryWalls,
} from '@/components/galleryExhibition/threejs/test/util/util';
import { INIT } from '../../../../../data/galleryData';

export default function Scene2({
  ready,
}: {
  ready: Dispatch<SetStateAction<boolean>>;
}) {
  const size = 21;
  const height = size * 0.3;

  const innerWalls = useMemo(() => generateGalleryWalls(size), [size]);
  const walls = useMemo(() => createWalls(size, height), [size, height]);

  const { active } = useProgress();

  useEffect(() => {
    if (!active) {
      ready(true);
    }
  }, [active]);
  return (
    <>
      <Canvas shadows camera={{ fov: 50 }}>
        <Room
          walls={walls}
          innerWalls={innerWalls}
          init={INIT}
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
