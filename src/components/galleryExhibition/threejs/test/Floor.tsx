import { MeshReflectorMaterial, useTexture } from '@react-three/drei';
import React from 'react';

export default function Floor({ size }: { size: number }) {
  const floorTexture = useTexture('/gallery/floor.jpg');
  return (
    <>
      <mesh rotation={[-Math.PI / 2, 0, 0]} receiveShadow>
        <planeGeometry args={[size, size]} />
        <MeshReflectorMaterial
          blur={[10, 5]}
          resolution={1024}
          mixBlur={0.3}
          mixStrength={3}
          roughness={0.4}
          depthScale={0.5}
          minDepthThreshold={0.4}
          maxDepthThreshold={1.2}
          color="#E6E6E3"
          map={floorTexture}
          metalness={0.1}
        />
      </mesh>
    </>
  );
}
