import React from 'react';

export default function Ceiling({
  size,
  height,
}: {
  size: number;
  height: number;
}) {
  return (
    <mesh rotation={[Math.PI / 2, 0, 0]} position={[0, height, 0]}>
      <planeGeometry args={[size, size]} />
      <meshStandardMaterial color="#F5F4F0" />
    </mesh>
  );
}
