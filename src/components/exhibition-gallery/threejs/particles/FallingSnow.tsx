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

type SnowState = {
  x: number;
  z: number;
  startY: number;
  speed: number;
  driftX: number;
  driftZ: number;
  size: number;
  initialT: number;
};

function SingleFlake({
  state,
  height,
  color,
  opacity,
}: {
  state: SnowState;
  height: number;
  color: string;
  opacity: number;
}) {
  const ref = useRef<Mesh>(null);
  const y = useRef(state.startY);
  const t = useRef(state.initialT);

  useFrame((_, delta) => {
    if (!ref.current) return;
    y.current -= state.speed * delta;
    t.current += delta * 0.5;

    if (y.current < 0) y.current = height;

    ref.current.position.x = state.x + Math.sin(t.current + state.driftX) * 0.3;
    ref.current.position.y = y.current;
    ref.current.position.z =
      state.z + Math.cos(t.current * 0.7 + state.driftZ) * 0.3;
  });

  return (
    <mesh ref={ref} position={[state.x, state.startY, state.z]}>
      <sphereGeometry args={[state.size, 8, 8]} />
      <meshBasicMaterial color={color} transparent opacity={opacity} />
    </mesh>
  );
}

export default function FallingSnow({
  count = 60,
  size,
  height,
  speed = 1.5,
  color = '#c8e8ff',
  opacity = 0.8,
}: {
  count?: number;
  size: number;
  height: number;
  speed?: number;
  color?: string;
  opacity?: number;
}) {
  const half = size / 2;

  const flakes = useMemo(
    () =>
      Array.from({ length: count }, (_, i) => ({
        x: rr(i * 6, -half, half),
        z: rr(i * 6 + 1, -half, half),
        startY: rr(i * 6 + 2, 0, height),
        speed: speed * rr(i * 6 + 3, 0.6, 1.4),
        driftX: rr(i * 6 + 4, 0, Math.PI * 2),
        driftZ: rr(i * 6 + 5, 0, Math.PI * 2),
        size: rr(i * 6 + 6, 0.03, 0.1),
        initialT: rr(i * 6 + 7, 0, Math.PI * 2),
      })),
    [count, half, height, speed]
  );

  return (
    <>
      {flakes.map((state, i) => (
        <SingleFlake
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
