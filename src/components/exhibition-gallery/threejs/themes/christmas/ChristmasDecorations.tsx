import React, { useMemo, useRef } from 'react';
import { useFrame } from '@react-three/fiber';
import { Sparkles } from '@react-three/drei';
import { PointLight } from 'three';

import { TreeDecoratedSnow } from '../../../models/TreeDecoratedSnow';
import { PresentACube } from '../../../models/PresentACube';
import { PresentARound } from '../../../models/PresentARound';
import { PresentBCube } from '../../../models/PresentBCube';
import { PresentBRound } from '../../../models/PresentBRound';
import { WreathDecorated } from '../../../models/WreathDecorated';
import { SnowPile } from '../../../models/SnowPile';

// Deterministic pseudo-random [0, 1) from integer seed
function sr(seed: number): number {
  const x = Math.sin(seed + 1) * 10000;
  return x - Math.floor(x);
}

// Random value in [min, max] from seed
function rr(seed: number, min: number, max: number): number {
  return min + sr(seed) * (max - min);
}

const PRESENT_TYPES = [
  PresentACube,
  PresentARound,
  PresentBCube,
  PresentBRound,
];

// 깜빡이는 포인트 라이트
function TwinklingLight({
  color,
  baseIntensity,
  phase,
  distance = 7,
}: {
  color: string;
  baseIntensity: number;
  phase: number;
  distance?: number;
}) {
  const ref = useRef<PointLight>(null);
  useFrame(({ clock }) => {
    if (ref.current) {
      ref.current.intensity =
        baseIntensity *
        (0.55 + 0.45 * Math.sin(clock.elapsedTime * 3.2 + phase));
    }
  });
  return <pointLight ref={ref} color={color} distance={distance} decay={2} />;
}

export default function ChristmasDecorations({
  size,
  height,
}: {
  size: number;
  height: number;
}) {
  const half = size / 2;
  const m = Math.max(1.2, half * 0.22);
  const inner = half - m;

  const cornerOffset = 0.8;
  const treeData = useMemo(
    () => [
      {
        pos: [-half + cornerOffset, 0, -half + cornerOffset] as [
          number,
          number,
          number,
        ],
        rot: Math.PI * 0.25,
      },
      {
        pos: [half - cornerOffset, 0, -half + cornerOffset] as [
          number,
          number,
          number,
        ],
        rot: -Math.PI * 0.25,
      },
      {
        pos: [-half + cornerOffset, 0, half - cornerOffset] as [
          number,
          number,
          number,
        ],
        rot: Math.PI * 0.75,
      },
      {
        pos: [half - cornerOffset, 0, half - cornerOffset] as [
          number,
          number,
          number,
        ],
        rot: -Math.PI * 0.75,
      },
    ],
    [half]
  );

  // 트리 조명 색상 (따뜻한 크리스마스 컬러)
  const treeLightColors = ['#ff8822', '#ff3333', '#22dd44', '#ffdd00'];

  const snowPiles = useMemo(
    () =>
      Array.from({ length: 3 }, (_, i) => ({
        pos: [
          rr(100 + i * 3, -inner * 0.9, inner * 0.9),
          0,
          rr(101 + i * 3, -inner * 0.9, inner * 0.9),
        ] as [number, number, number],
        scale: rr(102 + i * 3, 0.5, 3),
        rot: rr(103 + i * 3, 0, Math.PI * 2),
      })),
    [inner]
  );

  const floorPresents = useMemo(
    () =>
      Array.from({ length: 10 }, (_, i) => ({
        pos: [
          rr(130 + i * 4, -inner * 0.9, inner * 0.9),
          0,
          rr(131 + i * 4, -inner * 0.9, inner * 0.9),
        ] as [number, number, number],
        scale: rr(132 + i * 4, 0.22, 0.45),
        rot: rr(133 + i * 4, 0, Math.PI * 2),
        Component: PRESENT_TYPES[i % PRESENT_TYPES.length],
      })),
    [inner]
  );

  return (
    <>
      {/* 트리 4그루 + 깜빡이는 따뜻한 조명 */}
      {treeData.map(({ pos, rot }, i) => (
        <group key={`tree-${i}`} position={pos} rotation={[0, rot, 0]}>
          <TreeDecoratedSnow scale={0.8} />
          <SnowPile scale={0.8} position={[0, 0, 0]} />
          <TwinklingLight
            color={treeLightColors[i]}
            baseIntensity={0.3}
            phase={i * 1.5}
            distance={2}
          />
        </group>
      ))}

      {/* 바닥 눈더미 */}
      {snowPiles.map(({ pos, scale, rot }, i) => (
        <SnowPile
          key={`pile-${i}`}
          position={pos}
          scale={scale}
          rotation={[0, rot, 0]}
        />
      ))}

      {/* 바닥 선물 */}
      {floorPresents.map(({ pos, scale, rot, Component }, i) => (
        <Component
          key={`present-${i}`}
          position={pos}
          scale={scale}
          rotation={[0, rot, 0]}
        />
      ))}

      {/* 벽 리스 */}
      <WreathDecorated
        position={[0, height / 2 + 0.8, -half + 0.4]}
        scale={1.8}
        rotation={[0, 0, 0]}
      />
      <WreathDecorated
        position={[0, height / 2 + 0.8, half - 0.4]}
        scale={1.8}
        rotation={[0, Math.PI, 0]}
      />

      {/* 공간 전체에 은은한 반짝임 */}
      <Sparkles
        count={60}
        scale={[size - 1, height * 0.8, size - 1]}
        position={[0, height * 0.4, 0]}
        size={5}
        speed={0.15}
        opacity={0.55}
        color="#b8d8ff"
        noise={0.3}
      />
    </>
  );
}
