import { Canvas } from '@react-three/fiber';
import * as THREE from 'three';
import { PointerLockControls, useProgress } from '@react-three/drei';
import React, { Dispatch, SetStateAction, useEffect, useMemo } from 'react';
import { GalleryUIArtworkProps } from '@/types/gallery';
import { generateGalleryWalls, createWalls } from '@/lib/gallery/createWalls';
import Room from './Room';
import Player from './Player';
import { User } from '@supabase/supabase-js';
import { GalleryTheme, getThemeConfig } from '@/lib/gallery/themes.config';

function getGridSize(artworkCount: number): number {
  if (artworkCount <= 4) return 1;
  if (artworkCount <= 10) return 2;
  return 3;
}

export default function Scene2({
  exhibitionId,
  ready,
  init,
  user,
  theme,
}: {
  exhibitionId: string;
  ready: Dispatch<SetStateAction<boolean>>;
  init: GalleryUIArtworkProps[];
  user: User | null;
  theme: GalleryTheme;
}) {
  const height = 9;
  const cellSize = 7;
  const gridSize = getGridSize(init.length);
  const roomSize = gridSize * cellSize;

  const { innerWalls, startPosition } = useMemo(
    () => generateGalleryWalls(roomSize, gridSize, cellSize),
    [roomSize, gridSize]
  );

  const walls = useMemo(
    () => createWalls(roomSize, height),
    [roomSize, height]
  );

  const { active, loaded, total } = useProgress();
  const themeConfig = getThemeConfig(theme);

  useEffect(() => {
    ready(active === false && loaded === total && total > 0);
  }, [active, loaded, total, ready]);

  return (
    <Canvas
      shadows="soft"
      camera={{ fov: 65 }}
      gl={{
        antialias: true,
        toneMapping: THREE.ACESFilmicToneMapping,
        toneMappingExposure: 1.2,
      }}
    >
      <color attach="background" args={[themeConfig.background]} />
      {themeConfig.fog && (
        <fog
          attach="fog"
          args={[themeConfig.fog.color, themeConfig.fog.near, themeConfig.fog.far]}
        />
      )}
      <ambientLight
        color={themeConfig.ambientLight.color}
        intensity={themeConfig.ambientLight.intensity}
      />
      <Room
        user={user}
        exhibitionId={exhibitionId}
        walls={walls}
        innerWalls={innerWalls}
        init={init}
        size={roomSize}
        height={height}
        theme={theme}
      />
      <Player startPos={startPosition} innerWalls={innerWalls} speed={3} />
      <PointerLockControls />
    </Canvas>
  );
}
