import { Canvas } from '@react-three/fiber';
import * as THREE from 'three';
import {
  Cloud,
  PointerLockControls,
  Sky,
  useProgress,
} from '@react-three/drei';
import React, { Dispatch, SetStateAction, useEffect, useMemo } from 'react';
import { GalleryUIArtworkProps } from '@/types/gallery';
import { generateGalleryWalls, createWalls } from '@/lib/gallery/createWalls';
import Room from './Room';
import Player from './Player';
import { User } from '@supabase/supabase-js';

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
}: {
  exhibitionId: string;
  ready: Dispatch<SetStateAction<boolean>>;
  init: GalleryUIArtworkProps[];
  user: User | null;
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
        toneMappingExposure: 1.5,
      }}
    >
      <Sky
        distance={450000}
        sunPosition={[20, 15, 25]}
        turbidity={8}
        rayleigh={1.8}
        mieCoefficient={0.004}
        mieDirectionalG={0.88}
      />

      <Cloud
        position={[-40, 24, -50]}
        speed={0.04}
        opacity={0.7}
        segments={40}
        bounds={[18, 4, 8]}
      />
      <Cloud
        position={[-46, 26, -48]}
        speed={0.03}
        opacity={0.45}
        segments={25}
        bounds={[10, 3, 5]}
      />
      <Cloud
        position={[45, 22, 30]}
        speed={0.05}
        opacity={0.65}
        segments={45}
        bounds={[20, 5, 9]}
      />
      <Cloud
        position={[50, 25, 28]}
        speed={0.04}
        opacity={0.4}
        segments={20}
        bounds={[8, 3, 4]}
      />


      <hemisphereLight args={['#FFD0A0', '#C8A080', 0.5]} />
      <ambientLight intensity={0.9} color="#FFF5EE" />
      <directionalLight
        position={[20, 20, 25]}
        intensity={1.6}
        color="#FFB060"
        castShadow
        shadow-mapSize={[2048, 2048]}
        shadow-radius={20}
        shadow-bias={-0.001}
        shadow-normalBias={0.04}
        shadow-camera-near={1}
        shadow-camera-far={120}
        shadow-camera-left={-roomSize}
        shadow-camera-right={roomSize}
        shadow-camera-top={roomSize}
        shadow-camera-bottom={-roomSize}
      />

      <Room
        user={user}
        exhibitionId={exhibitionId}
        size={roomSize}
        height={height}
        walls={walls}
        innerWalls={innerWalls}
        init={init}
      />
      <Player startPos={startPosition} innerWalls={innerWalls} speed={3} />
      <PointerLockControls />
    </Canvas>
  );
}
