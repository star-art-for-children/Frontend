import React, { useEffect, useMemo, useRef } from 'react';
import { useFrame } from '@react-three/fiber';
import {
  DoubleSide,
  Group,
  MeshStandardMaterial,
  Shape,
  ShapeGeometry,
} from 'three';

function sr(seed: number): number {
  const x = Math.sin(seed + 1) * 10000;
  return x - Math.floor(x);
}

function rr(seed: number, min: number, max: number): number {
  return min + sr(seed) * (max - min);
}

/** 초록 → 단풍(갈색/주황) 잎 색 팔레트 */
const LEAF_COLORS = ['#6BA34A', '#4F8C3A', '#C9882E', '#B5651D', '#D9A441'];

type LeafState = {
  x: number;
  z: number;
  startY: number;
  speed: number;
  driftX: number;
  driftZ: number;
  rotSpeed: number;
  scale: number;
  initialRotY: number;
  colorIndex: number;
};

function SingleLeaf({
  state,
  height,
  geometry,
  material,
}: {
  state: LeafState;
  height: number;
  geometry: ShapeGeometry;
  material: MeshStandardMaterial;
}) {
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
    ref.current.rotation.x = Math.sin(y.current * 0.7) * 0.6;
    ref.current.rotation.z = Math.cos(y.current * 0.5) * 0.4;
  });

  return (
    <group ref={ref} scale={state.scale}>
      <mesh geometry={geometry} material={material} castShadow />
    </group>
  );
}

export default function FallingLeaves({
  count = 40,
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

  const geometry = useMemo(() => {
    const shape = new Shape();
    shape.moveTo(0, -0.5);
    shape.bezierCurveTo(0.45, -0.2, 0.4, 0.35, 0, 0.6);
    shape.bezierCurveTo(-0.4, 0.35, -0.45, -0.2, 0, -0.5);
    const geo = new ShapeGeometry(shape);
    geo.center();
    return geo;
  }, []);

  const materials = useMemo(
    () =>
      LEAF_COLORS.map(
        (color) =>
          new MeshStandardMaterial({
            color,
            side: DoubleSide,
            roughness: 0.85,
          })
      ),
    []
  );

  useEffect(
    () => () => {
      geometry.dispose();
      materials.forEach((m) => m.dispose());
    },
    [geometry, materials]
  );

  const leaves = useMemo(
    () =>
      Array.from({ length: count }, (_, i) => ({
        x: rr(i * 7, -half, half),
        z: rr(i * 7 + 1, -half, half),
        startY: rr(i * 7 + 2, 0, height),
        speed: speed * rr(i * 7 + 3, 0.5, 1.2),
        driftX: rr(i * 7 + 4, 0.4, 1.0),
        driftZ: rr(i * 7 + 5, 0.4, 1.0),
        rotSpeed: rr(i * 7 + 6, 0.6, 2.2),
        scale: rr(i * 7 + 7, 0.25, 0.5),
        initialRotY: rr(i * 7 + 8, 0, Math.PI * 2),
        colorIndex: Math.floor(sr(i * 7 + 9) * LEAF_COLORS.length),
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
          geometry={geometry}
          material={materials[state.colorIndex]}
        />
      ))}
    </>
  );
}
