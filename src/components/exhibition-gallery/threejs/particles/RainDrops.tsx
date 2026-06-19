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

type DropState = {
  x: number;
  z: number;
  startY: number;
  speed: number;
  windX: number;
};

export default function RainDrops({
  count = 200,
  size,
  height,
  speed = 8,
  color = '#a8cfe0',
  opacity = 0.55,
}: {
  count?: number;
  size: number;
  height: number;
  speed?: number;
  color?: string;
  opacity?: number;
}) {
  const half = size / 2;

  const drops = useMemo<DropState[]>(
    () =>
      Array.from({ length: count }, (_, i) => ({
        x: rr(i * 5, -half, half),
        z: rr(i * 5 + 1, -half, half),
        startY: rr(i * 5 + 2, 0, height),
        speed: speed * rr(i * 5 + 3, 0.8, 1.2),
        windX: rr(i * 5 + 4, -1, 1),
      })),
    [count, half, height, speed]
  );

  const meshRefs = useRef<(Mesh | null)[]>([]);
  const yState = useRef<number[]>([]);

  useEffect(() => {
    yState.current = drops.map((d) => d.startY);
  }, [drops]);

  useFrame((_, delta) => {
    for (let i = 0; i < drops.length; i++) {
      const mesh = meshRefs.current[i];
      if (!mesh) continue;
      const s = drops[i];

      yState.current[i] -= s.speed * delta;
      if (yState.current[i] < 0) yState.current[i] = height;

      const y = yState.current[i];
      mesh.position.y = y;
      mesh.position.x = s.x + (height - y) * s.windX * 0.04;
    }
  });

  return (
    <>
      {drops.map((state, i) => (
        <mesh
          key={i}
          ref={(el) => {
            meshRefs.current[i] = el;
          }}
          position={[state.x, state.startY, state.z]}
        >
          <cylinderGeometry args={[0.012, 0.004, 0.22, 3]} />
          <meshBasicMaterial color={color} transparent opacity={opacity} />
        </mesh>
      ))}
    </>
  );
}
