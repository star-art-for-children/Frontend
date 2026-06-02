import React, { useMemo, useRef } from 'react';
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

function SingleDrop({
  state,
  height,
  color,
  opacity,
}: {
  state: DropState;
  height: number;
  color: string;
  opacity: number;
}) {
  const ref = useRef<Mesh>(null);
  const y = useRef(state.startY);

  useFrame((_, delta) => {
    if (!ref.current) return;
    y.current -= state.speed * delta;
    if (y.current < 0) y.current = height;
    ref.current.position.y = y.current;
    ref.current.position.x =
      state.x + (height - y.current) * state.windX * 0.04;
  });

  return (
    <mesh ref={ref} position={[state.x, state.startY, state.z]}>
      <cylinderGeometry args={[0.012, 0.004, 0.22, 3]} />
      <meshBasicMaterial color={color} transparent opacity={opacity} />
    </mesh>
  );
}

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

  const drops = useMemo(
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

  return (
    <>
      {drops.map((state, i) => (
        <SingleDrop
          key={i}
          state={state}
          height={height}
          color={color}
          opacity={opacity}
        />
      ))}
    </>
  );
}
