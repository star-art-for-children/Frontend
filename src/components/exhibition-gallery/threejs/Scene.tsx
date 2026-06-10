import { Canvas } from '@react-three/fiber';
import * as THREE from 'three';
import {
  Cloud,
  GradientTexture,
  PointerLockControls,
  Sky,
  Stars,
  useProgress,
} from '@react-three/drei';
import React, {
  Dispatch,
  SetStateAction,
  useCallback,
  useEffect,
  useMemo,
  useRef,
} from 'react';
import { GalleryUIArtworkProps } from '@/types/gallery';
import { GalleryPreset } from '@/types/gallery-theme';
import { generateGalleryWalls, createWalls } from '@/lib/gallery/createWalls';
import { defaultPreset } from '@/lib/gallery/presets';
import Room from './Room';
import Player from './Player';
import DynamicDecorations, { CircleCollider } from './DynamicDecorations';
import RemotePlayers from './RemotePlayers';
import { RemotePlayerData, PlayerInfo } from '@/hooks/usePlayerSocket';

function getGridSize(artworkCount: number): number {
  if (artworkCount <= 4) return 1;
  if (artworkCount <= 10) return 2;
  return 3;
}

export default function Scene2({
  exhibitionId,
  ready,
  init,
  canLikes,
  canStamp = false,
  onStampProgress,
  preset = defaultPreset,
  sendMove,
  remotePlayersRef,
  playerInfo,
}: {
  exhibitionId: string;
  ready: Dispatch<SetStateAction<boolean>>;
  init: GalleryUIArtworkProps[];
  canLikes: boolean;
  canStamp?: boolean;
  onStampProgress?: (collected: number, total: number) => void;
  preset?: GalleryPreset;
  sendMove?: (camera: THREE.Camera) => void;
  remotePlayersRef?: React.RefObject<Map<string, RemotePlayerData>>;
  playerInfo?: PlayerInfo[];
}) {
  const height = 9;
  const cellSize = 12;
  const spawnCornerOffset = 2;
  const gridSize = getGridSize(init.length);
  const roomSize = gridSize * cellSize;

  const { innerWalls, startPosition } = useMemo(
    () =>
      generateGalleryWalls(
        roomSize,
        gridSize,
        cellSize,
        preset.wallColor,
        spawnCornerOffset,
        exhibitionId
      ),
    [roomSize, gridSize, preset.wallColor, exhibitionId]
  );

  const walls = useMemo(
    () => createWalls(roomSize, height, preset.wallColor),
    [roomSize, height, preset.wallColor]
  );

  const { active, loaded, total } = useProgress();
  useEffect(() => {
    ready(!active && loaded === total && total > 0);
  }, [active, loaded, total, ready]);

  const circleCollidersRef = useRef<CircleCollider[]>([]);
  const handleColliders = useCallback((c: CircleCollider[]) => {
    circleCollidersRef.current = c;
  }, []);

  const atmosphere = preset.atmosphere ?? defaultPreset.atmosphere;
  const lighting = preset.lighting ?? defaultPreset.lighting;
  const mergedPreset: typeof preset = {
    ...defaultPreset,
    ...preset,
    atmosphere,
    lighting,
    decorations: preset.decorations ?? defaultPreset.decorations,
    particles: preset.particles ?? defaultPreset.particles,
    floor: preset.floor ?? defaultPreset.floor,
  };

  return (
    <Canvas
      shadows="soft"
      camera={{ fov: 65 }}
      gl={{
        antialias: true,
        toneMapping: THREE.ACESFilmicToneMapping,
        toneMappingExposure: lighting.toneMappingExposure,
      }}
    >
      {atmosphere.type === 'sky' && (
        <>
          <Sky
            distance={450000}
            sunPosition={atmosphere.sunPosition}
            turbidity={atmosphere.turbidity}
            rayleigh={atmosphere.rayleigh}
            mieCoefficient={atmosphere.mieCoefficient}
            mieDirectionalG={atmosphere.mieDirectionalG}
          />
          {atmosphere.clouds && (
            <>
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
            </>
          )}
        </>
      )}

      {atmosphere.type === 'night' && (
        <>
          <color attach="background" args={[atmosphere.bgColor]} />
          <Stars
            radius={atmosphere.stars.radius}
            depth={atmosphere.stars.depth}
            count={atmosphere.stars.count}
            factor={atmosphere.stars.factor}
            saturation={atmosphere.stars.saturation}
            fade
            speed={atmosphere.stars.speed}
          />
        </>
      )}

      {atmosphere.type === 'gradient' && (
        <mesh>
          <sphereGeometry args={[500, 32, 32]} />
          <meshBasicMaterial side={THREE.BackSide} depthWrite={false}>
            <GradientTexture
              stops={[0, 1]}
              colors={[atmosphere.bottomColor, atmosphere.topColor]}
            />
          </meshBasicMaterial>
        </mesh>
      )}

      <hemisphereLight args={lighting.hemisphere} />
      <ambientLight
        intensity={lighting.ambient.intensity}
        color={lighting.ambient.color}
      />
      <directionalLight
        position={lighting.directional.position}
        intensity={lighting.directional.intensity}
        color={lighting.directional.color}
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
        canLikes={canLikes}
        canStamp={canStamp}
        onStampProgress={onStampProgress}
        exhibitionId={exhibitionId}
        size={roomSize}
        height={height}
        walls={walls}
        innerWalls={innerWalls}
        init={init}
        floorConfig={mergedPreset.floor}
        wallColor={mergedPreset.wallColor}
        wallPattern={mergedPreset.wallPattern}
      />
      <DynamicDecorations
        preset={mergedPreset}
        size={roomSize}
        height={height}
        cellSize={cellSize}
        gridSize={gridSize}
        innerWalls={innerWalls}
        onColliders={handleColliders}
      />
      {remotePlayersRef && playerInfo && (
        <RemotePlayers
          playerInfo={playerInfo}
          remotePlayersRef={remotePlayersRef}
        />
      )}
      <Player
        startPos={startPosition}
        startLookAt={{
          x: -roomSize / 2 + cellSize / 2,
          y: startPosition.y,
          z: -roomSize / 2 + cellSize / 2,
        }}
        innerWalls={innerWalls}
        circleCollidersRef={circleCollidersRef}
        speed={3}
        sendMove={sendMove}
      />
      <PointerLockControls selector="canvas" />
    </Canvas>
  );
}
