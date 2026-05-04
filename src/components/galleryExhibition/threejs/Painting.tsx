import * as THREE from 'three';
import React, { useEffect, useRef } from 'react';
import { useTexture } from '@react-three/drei';
import { PaintingType } from '@/types/gallery';

export default function Painting({
  x,
  register,
  unregister,
  paintingDetails,
}: {
  x: number;
  register: (mesh: THREE.Mesh) => void;
  unregister: (mesh: THREE.Mesh) => void;
  paintingDetails: PaintingType;
}) {
  const meshRef = useRef<THREE.Mesh>(null);
  const paintTexture = useTexture(paintingDetails.paintingUrl);

  useEffect(() => {
    if (!meshRef.current) return;
    const mesh = meshRef.current;
    mesh.userData.id = paintingDetails.id;
    register(mesh);
    return () => unregister(mesh);
  }, []);

  return (
    <group position={[x, 0, 0.2]}>
      <mesh ref={meshRef}>
        <boxGeometry args={[2, 1.5, 0.3]} />
        <meshStandardMaterial color="grey" />
      </mesh>
      <mesh position={[0, 0, 0.16]}>
        <planeGeometry args={[1.8, 1.3]} />
        <meshStandardMaterial map={paintTexture} toneMapped={false} />
      </mesh>
    </group>
  );
}
