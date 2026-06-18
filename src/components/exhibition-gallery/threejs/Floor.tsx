import React, { useMemo } from 'react';
import { useTexture } from '@react-three/drei';
import { MeshReflectorMaterial } from '@react-three/drei';
import { RepeatWrapping } from 'three';

export default function Floor({ size }: { size: number }) {
  const texture = useTexture('/gallery/floor.webp');

  const cloned = useMemo(() => {
    const t = texture.clone();
    t.wrapS = RepeatWrapping;
    t.wrapT = RepeatWrapping;
    t.repeat.set(size / 8, size / 8);
    t.needsUpdate = true;
    return t;
  }, [texture, size]);

  return (
    <mesh rotation={[-Math.PI / 2, 0, 0]} receiveShadow>
      <planeGeometry args={[size, size]} />
      <MeshReflectorMaterial
        map={cloned}
        blur={[300, 100]}
        resolution={512}
        mixBlur={0.8}
        mixStrength={1}
        roughness={0.7}
        depthScale={0.5}
        minDepthThreshold={0.4}
        maxDepthThreshold={1.0}
        metalness={0.05}
        mirror={0}
      />
    </mesh>
  );
}
