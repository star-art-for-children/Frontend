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

function SingleBubble({
  state,
  height,
  color,
  opacity,
}: {
  state: BubbleState;
  height: number;
  color: string;
  opacity: number;
}) {
  const ref = useRef<Mesh>(null);
  const y = useRef(state.startY);
  const t = useRef(state.initialT);

  useFrame((_, delta) => {
    if (!ref.current) return;
    y.current += state.speed * delta;
    t.current += delta * 0.5;

    if (y.current > height) y.current = 0;

    ref.current.position.x =
      state.x + Math.sin(t.current + state.driftX) * 0.4;
    ref.current.position.y = y.current;
    ref.current.position.z =
      state.z + Math.cos(t.current * 0.7 + state.driftZ) * 0.4;
  });

  return (
    <mesh ref={ref} position={[state.x, state.startY, state.z]}>
      <sphereGeometry args={[state.size, 12, 12]} />
      <meshBasicMaterial color={color} transparent opacity={opacity} />
    </mesh>
  );
}

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

  const bubbles = useMemo(
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

  return (
    <>
      {bubbles.map((state, i) => (
        <SingleBubble
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
