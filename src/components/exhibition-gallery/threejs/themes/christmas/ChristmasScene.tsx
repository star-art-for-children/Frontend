import { Canvas } from '@react-three/fiber';
import * as THREE from 'three';
import {
  Cloud,
  PointerLockControls,
  Stars,
  useProgress,
} from '@react-three/drei';
import React, { Dispatch, SetStateAction, useEffect, useMemo } from 'react';
import { GalleryUIArtworkProps } from '@/types/gallery';
import { generateGalleryWalls, createWalls } from '@/lib/gallery/createWalls';
import Room from '../../Room';
import Player from '../../Player';
import { User } from '@supabase/supabase-js';
import ChristmasFloor from './ChristmasFloor';
import ChristmasDecorations from './ChristmasDecorations';

function getGridSize(artworkCount: number): number {
  if (artworkCount <= 4) return 1;
  if (artworkCount <= 10) return 2;
  return 3;
}

export default function ChristmasScene({
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
        toneMappingExposure: 1.1,
      }}
    >
      {/* 밤하늘 */}
      <color attach="background" args={['#03060f']} />
      <Stars
        radius={120}
        depth={60}
        count={6000}
        factor={5}
        saturation={0.3}
        fade
        speed={0.6}
      />

      {/* 밤 구름 */}
      <Cloud
        position={[-40, 24, -50]}
        speed={0.01}
        opacity={0.18}
        color="#1a1f3a"
        segments={20}
        bounds={[18, 4, 8]}
      />
      <Cloud
        position={[45, 22, 30]}
        speed={0.012}
        opacity={0.15}
        color="#151a30"
        segments={20}
        bounds={[20, 5, 9]}
      />
      <Cloud
        position={[10, 30, -60]}
        speed={0.01}
        opacity={0.12}
        color="#1a1f3a"
        segments={15}
        bounds={[14, 4, 6]}
      />
      <Cloud
        position={[-20, 28, 55]}
        speed={0.01}
        opacity={0.14}
        color="#151a30"
        segments={15}
        bounds={[12, 3, 6]}
      />

      {/* 달빛 조명 */}
      <hemisphereLight args={['#1a2a50', '#0d1530', 0.8]} />
      <ambientLight intensity={0.55} color="#c8d8ff" />
      <directionalLight
        position={[-20, 35, -25]}
        intensity={0.7}
        color="#8aaae0"
        castShadow
        shadow-mapSize={[4096, 4096]}
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

      {/* 전시 룸 — 크리스마스 바닥 주입 */}
      <Room
        user={user}
        exhibitionId={exhibitionId}
        size={roomSize}
        height={height}
        walls={walls}
        innerWalls={innerWalls}
        init={init}
        FloorComponent={ChristmasFloor}
      />

      {/* 크리스마스 장식 */}
      <ChristmasDecorations size={roomSize} height={height} />

      <Player startPos={startPosition} innerWalls={innerWalls} speed={3} />
      <PointerLockControls />
    </Canvas>
  );
}
