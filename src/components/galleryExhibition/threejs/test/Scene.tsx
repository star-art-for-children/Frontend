import { Canvas } from '@react-three/fiber';
import { PointerLockControls, useTexture } from '@react-three/drei';
import React, { useMemo } from 'react';
import Room from '@/components/galleryExhibition/threejs/test/Room';

import Player from '@/components/galleryExhibition/threejs/test/Player';
import {
  createWalls,
  generateGalleryWalls,
} from '@/components/galleryExhibition/threejs/test/util/util';
import { INIT } from '../../../../../data/galleryData';

export default function Scene2() {
  const size = 21;
  const height = size * 0.3;

  const innerWalls = useMemo(() => generateGalleryWalls(size), []);
  const walls = createWalls(size, height);

  const urls = useMemo(() => INIT.map((x) => x.paintingUrl), [INIT]);
  useTexture.preload(urls); // preload

  return (
    <div className={'h-screen w-screen bg-white'}>
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
    </div>
  );
}
