import { Canvas } from '@react-three/fiber';
import { PointerLockControls, useProgress } from '@react-three/drei';
import React, { Dispatch, SetStateAction, useEffect, useMemo } from 'react';
import { GalleryUIArtworkProps } from '@/types/gallery';
import { createWalls, generateGalleryWalls } from '@/lib/gallery/createWalls';
import Room from '@/components/galleryExhibition/threejs/Room';
import Player from '@/components/galleryExhibition/threejs/Player';
import { User } from '@supabase/supabase-js';

function getGridSize(artworkCount: number) {
  if (artworkCount <= 4) return 1;
  if (artworkCount <= 10) return 2;
  return 3;
}
export default function Scene2({
  exhibitionId,
  ready,
  init,
  user,
}: {
  exhibitionId: string;
  ready: Dispatch<SetStateAction<boolean>>;
  init: GalleryUIArtworkProps[];
  user: User | null;
}) {
  const artworkCount = init.length;
  const cellSize = 7;
  const gridSize = getGridSize(artworkCount);
  const size = gridSize * cellSize;

  const height = 6;
  const { innerWalls, startPosition } = useMemo(
    () => generateGalleryWalls(size),
    [size]
  );
  const walls = useMemo(() => createWalls(size, height), [size, height]);

  const { active, loaded, total } = useProgress();

  useEffect(() => {
    ready(active === false && loaded === total && total > 0);
  }, [active, loaded, total, ready]);
  return (
    <>
      <Canvas shadows camera={{ fov: 50 }}>
        <Room
          user={user}
          exhibitionId={exhibitionId}
          walls={walls}
          innerWalls={innerWalls}
          init={init}
          size={size}
          height={height}
        />
        <ambientLight intensity={1} />

        <Player startPos={startPosition} innerWalls={innerWalls} speed={3} />
        <PointerLockControls />
      </Canvas>
    </>
  );
}
