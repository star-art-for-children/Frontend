import React from 'react';
import { MeshReflectorMaterial } from '@react-three/drei';

export default function ChristmasFloor({ size }: { size: number }) {
  return (
    <mesh rotation={[-Math.PI / 2, 0, 0]} receiveShadow>
      <planeGeometry args={[size, size]} />
      <MeshReflectorMaterial
        blur={[1000, 500]}
        resolution={512}
        mixBlur={1.0}
        mixStrength={1.2}
        roughness={0.5}
        depthScale={0.3}
        minDepthThreshold={0.6}
        maxDepthThreshold={1.0}
        metalness={0.0}
        mirror={0.15}
        color="#d4eeff"
      />
    </mesh>
  );
}
