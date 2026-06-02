import React, { useMemo } from 'react';
import { useTexture } from '@react-three/drei';
import { MeshReflectorMaterial } from '@react-three/drei';
import { RepeatWrapping } from 'three';
import { FloorConfig } from '@/types/gallery-theme';

export default function DynamicFloor({
  size,
  config,
}: {
  size: number;
  config: FloorConfig;
}) {
  const texture = useTexture('/gallery/floor.jpg');

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
        map={config.useTexture ? cloned : null}
        color={config.color}
        blur={config.blur as [number, number]}
        resolution={512}
        mixBlur={config.useTexture ? 0.8 : 1.0}
        mixStrength={config.useTexture ? 1 : 1.2}
        roughness={config.roughness}
        depthScale={0.5}
        minDepthThreshold={0.4}
        maxDepthThreshold={1.0}
        metalness={config.metalness}
        mirror={config.mirror}
      />
    </mesh>
  );
}
