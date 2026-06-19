import React, { useEffect, useMemo, useRef } from 'react';
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

  const petals = useMemo<PetalState[]>(
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

  const groupRefs = useRef<(Group | null)[]>([]);
  const yState = useRef<number[]>([]);
  const rotYState = useRef<number[]>([]);

  useEffect(() => {
    yState.current = petals.map((p) => p.startY);
    rotYState.current = petals.map((p) => p.initialRotY);
  }, [petals]);

  useFrame((_, delta) => {
    for (let i = 0; i < petals.length; i++) {
      const group = groupRefs.current[i];
      if (!group) continue;
      const s = petals[i];

      yState.current[i] -= s.speed * delta;
      rotYState.current[i] += s.rotSpeed * delta;

      if (yState.current[i] < -0.5) {
        yState.current[i] = height + rr(yState.current[i] * 1000, 0, height);
      }

      const y = yState.current[i];
      group.position.x = s.x + Math.sin(y * 0.5) * s.driftX;
      group.position.y = y;
      group.position.z = s.z + Math.cos(y * 0.4) * s.driftZ;
      group.rotation.y = rotYState.current[i];
      group.rotation.x = Math.sin(y * 0.7) * 0.4;
    }
  });

  return (
    <>
      {petals.map((state, i) => (
        <group
          key={i}
          ref={(el) => {
            groupRefs.current[i] = el;
          }}
          scale={state.scale}
        >
          <FlowerPetal />
        </group>
      ))}
    </>
  );
}
