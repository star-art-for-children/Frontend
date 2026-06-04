import React, { useMemo, useRef } from 'react';
import { useFrame } from '@react-three/fiber';
import * as THREE from 'three';

function sr(seed: number): number {
  const x = Math.sin(seed + 1) * 10000;
  return x - Math.floor(x);
}

function rr(seed: number, min: number, max: number): number {
  return min + sr(seed) * (max - min);
}

const leafShape = new THREE.Shape();
leafShape.moveTo(0, 0.22);
leafShape.bezierCurveTo(0.13, 0.16, 0.15, 0.04, 0.08, -0.1);
leafShape.bezierCurveTo(0.03, -0.2, 0, -0.22, 0, -0.22);
leafShape.bezierCurveTo(0, -0.22, -0.03, -0.2, -0.08, -0.1);
leafShape.bezierCurveTo(-0.15, 0.04, -0.13, 0.16, 0, 0.22);

const LEAF_GEOMETRY = new THREE.ShapeGeometry(leafShape);

type LeafState = {
  x: number;
  z: number;
  startY: number;
  speed: number;
  swingAmp: number;
  swingFreq: number;
  swingPhase: number;
  driftZ: number;
  driftZPhase: number;
  rotSpeedX: number;
  rotSpeedZ: number;
  initialRotY: number;
  scale: number;
  initialT: number;
};

function SingleLeaf({
  state,
  height,
  color,
  opacity,
}: {
  state: LeafState;
  height: number;
  color: string;
  opacity: number;
}) {
  const ref = useRef<THREE.Group>(null);
  const y = useRef(state.startY);
  const t = useRef(state.initialT);
  const rotX = useRef(0);
  const rotZ = useRef(0);

  useFrame((_, delta) => {
    if (!ref.current) return;
    y.current -= state.speed * delta;
    t.current += delta;
    rotX.current += state.rotSpeedX * delta;
    rotZ.current += state.rotSpeedZ * delta;

    if (y.current < -0.5)
      y.current = height + rr(y.current * 997, 0, height * 0.4);

    ref.current.position.x =
      state.x +
      Math.sin(t.current * state.swingFreq + state.swingPhase) * state.swingAmp;
    ref.current.position.y = y.current;
    ref.current.position.z =
      state.z + Math.cos(t.current * 0.7 + state.driftZPhase) * state.driftZ;
    ref.current.rotation.x = rotX.current;
    ref.current.rotation.y =
      state.initialRotY + Math.sin(t.current * 0.4) * 0.5;
    ref.current.rotation.z = rotZ.current;
  });

  return (
    <group ref={ref} scale={state.scale}>
      <mesh geometry={LEAF_GEOMETRY}>
        <meshBasicMaterial
          color={color}
          side={THREE.DoubleSide}
          transparent
          opacity={opacity}
        />
      </mesh>
    </group>
  );
}

export default function FallingLeaves({
  count = 50,
  size,
  height,
  speed = 1.2,
  color = '#c0392b',
  opacity = 0.9,
}: {
  count?: number;
  size: number;
  height: number;
  speed?: number;
  color?: string;
  opacity?: number;
}) {
  const half = size / 2 - 0.5;

  const leaves = useMemo(
    () =>
      Array.from({ length: count }, (_, i) => ({
        x: rr(i * 9, -half, half),
        z: rr(i * 9 + 1, -half, half),
        startY: rr(i * 9 + 2, 0, height),
        speed: speed * rr(i * 9 + 3, 0.5, 1.5),
        swingAmp: rr(i * 9 + 4, 0.4, 1.2),
        swingFreq: rr(i * 9 + 5, 0.5, 1.5),
        swingPhase: rr(i * 9 + 6, 0, Math.PI * 2),
        driftZ: rr(i * 9 + 7, 0.2, 0.8),
        driftZPhase: rr(i * 9 + 8, 0, Math.PI * 2),
        rotSpeedX: rr(i * 9 + 9, 0.8, 2.5),
        rotSpeedZ: rr(i * 9 + 10, -1.5, 1.5),
        initialRotY: rr(i * 9 + 11, 0, Math.PI * 2),
        scale: rr(i * 9 + 12, 0.6, 1.4),
        initialT: rr(i * 9 + 13, 0, Math.PI * 2),
      })),
    [count, half, height, speed]
  );

  return (
    <>
      {leaves.map((state, i) => (
        <SingleLeaf
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
