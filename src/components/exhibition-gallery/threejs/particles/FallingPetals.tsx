import React, { useMemo, useRef } from 'react';
import { useFrame } from '@react-three/fiber';
import { Group } from 'three';
import { FlowerPetal } from '../../models/basic/FlowerPetal';

function sr(seed: number): number {
  const x = Math.sin(seed + 1) * 10000;
  return x - Math.floor(x);
}

function rr(seed: number, min: number, max: number): number {
  return min + sr(seed) * (max - min);
}

type PetalState = {
  x: number;
  z: number;
  startY: number;
  speed: number;
  driftX: number;
  driftZ: number;
  rotSpeed: number;
  scale: number;
  initialRotY: number;
};

function SinglePetal({ state, height }: { state: PetalState; height: number }) {
  const ref = useRef<Group>(null);
  const y = useRef(state.startY);
  const rotY = useRef(state.initialRotY);

  useFrame((_, delta) => {
    if (!ref.current) return;
    y.current -= state.speed * delta;
    rotY.current += state.rotSpeed * delta;

    if (y.current < -0.5) y.current = height + rr(y.current * 1000, 0, height);

    ref.current.position.x = state.x + Math.sin(y.current * 0.5) * state.driftX;
    ref.current.position.y = y.current;
    ref.current.position.z = state.z + Math.cos(y.current * 0.4) * state.driftZ;
    ref.current.rotation.y = rotY.current;
    ref.current.rotation.x = Math.sin(y.current * 0.7) * 0.4;
  });

  return (
    <group ref={ref} scale={state.scale}>
      <FlowerPetal />
    </group>
  );
}

export default function FallingPetals({
  count = 30,
  size,
  height,
  speed = 1.0,
}: {
  count?: number;
  size: number;
  height: number;
  speed?: number;
}) {
  const half = size / 2 - 0.5;

  const petals = useMemo(
    () =>
      Array.from({ length: count }, (_, i) => ({
        x: rr(i * 7, -half, half),
        z: rr(i * 7 + 1, -half, half),
        startY: rr(i * 7 + 2, 0, height),
        speed: speed * rr(i * 7 + 3, 0.6, 1.4),
        driftX: rr(i * 7 + 4, 0.3, 0.8),
        driftZ: rr(i * 7 + 5, 0.3, 0.8),
        rotSpeed: rr(i * 7 + 6, 0.5, 2.0),
        scale: rr(i * 7 + 7, 0.3, 0.6),
        initialRotY: rr(i * 7 + 8, 0, Math.PI * 2),
      })),
    [count, half, height, speed]
  );

  return (
    <>
      {petals.map((state, i) => (
        <SinglePetal key={i} state={state} height={height} />
      ))}
    </>
  );
}
