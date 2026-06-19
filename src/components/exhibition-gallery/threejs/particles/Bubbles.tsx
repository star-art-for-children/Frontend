import React, { useEffect, useMemo, useRef } from 'react';
import { useFrame } from '@react-three/fiber';
import { Mesh } from 'three';

function sr(seed: number): number {
  const x = Math.sin(seed + 1) * 10000;
  return x - Math.floor(x);
}

function rr(seed: number, min: number, max: number): number {
  return min + sr(seed) * (max - min);
}

type BubbleState = {
  x: number;
  z: number;
  startY: number;
  speed: number;
  driftX: number;
  driftZ: number;
  size: number;
  initialT: number;
};

export default function Bubbles({
  count = 30,
  size,
  height,
  speed = 0.3,
  color = '#c8f0ff',
  opacity = 0.4,
}: {
  count?: number;
  size: number;
  height: number;
  speed?: number;
  color?: string;
  opacity?: number;
}) {
  const half = size / 2;

  const bubbles = useMemo<BubbleState[]>(
    () =>
      Array.from({ length: count }, (_, i) => ({
        x: rr(i * 6, -half, half),
        z: rr(i * 6 + 1, -half, half),
        startY: rr(i * 6 + 2, 0, height),
        speed: speed * rr(i * 6 + 3, 0.6, 1.4),
        driftX: rr(i * 6 + 4, 0, Math.PI * 2),
        driftZ: rr(i * 6 + 5, 0, Math.PI * 2),
        size: rr(i * 6 + 6, 0.05, 0.2),
        initialT: rr(i * 6 + 7, 0, Math.PI * 2),
      })),
    [count, half, height, speed]
  );

  const meshRefs = useRef<(Mesh | null)[]>([]);
  const yState = useRef<number[]>([]);
  const tState = useRef<number[]>([]);

  useEffect(() => {
    yState.current = bubbles.map((b) => b.startY);
    tState.current = bubbles.map((b) => b.initialT);
  }, [bubbles]);

  useFrame((_, delta) => {
    for (let i = 0; i < bubbles.length; i++) {
      const mesh = meshRefs.current[i];
      if (!mesh) continue;
      const s = bubbles[i];

      yState.current[i] += s.speed * delta;
      tState.current[i] += delta * 0.5;

      if (yState.current[i] > height) yState.current[i] = 0;

      const y = yState.current[i];
      const t = tState.current[i];
      mesh.position.x = s.x + Math.sin(t + s.driftX) * 0.4;
      mesh.position.y = y;
      mesh.position.z = s.z + Math.cos(t * 0.7 + s.driftZ) * 0.4;
    }
  });

  return (
    <>
      {bubbles.map((state, i) => (
        <mesh
          key={i}
          ref={(el) => {
            meshRefs.current[i] = el;
          }}
          position={[state.x, state.startY, state.z]}
        >
          <sphereGeometry args={[state.size, 12, 12]} />
          <meshBasicMaterial color={color} transparent opacity={opacity} />
        </mesh>
      ))}
    </>
  );
}
