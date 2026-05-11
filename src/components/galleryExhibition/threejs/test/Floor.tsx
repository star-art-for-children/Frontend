import { MeshReflectorMaterial, useTexture } from '@react-three/drei';
import React from 'react';

export default function Floor({ size }: { size: number }) {
  const floorTexture = useTexture('/gallery/floor.jpg');
  return (
    <>
      <mesh rotation={[-Math.PI / 2, 0, 0]} receiveShadow>
        <planeGeometry args={[size, size]} />
        <MeshReflectorMaterial
          blur={[800, 200]}
          resolution={1024}
          mixBlur={1.5}
          mixStrength={0.6}
          roughness={0.85}
          depthScale={0.2}
          minDepthThreshold={0.4}
          maxDepthThreshold={1.4}
          color="#f7f7f7"
          map={floorTexture}
          metalness={0}
          transparent
          opacity={0.8}
        />
      </mesh>
    </>
  );
}
