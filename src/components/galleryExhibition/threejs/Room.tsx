import * as THREE from 'three';
import { useFrame } from '@react-three/fiber';
import React, { useRef } from 'react';
import Painting from '@/components/galleryExhibition/threejs/Painting';
import { PaintingType } from '../../../types/gallery';
import { createWalls } from '@/components/galleryExhibition/threejs/test/util/util';

export default function Room({
  setIsModalOpen,
  init,
}: {
  setIsModalOpen: React.Dispatch<React.SetStateAction<null | number>>;
  init: PaintingType[];
}) {
  const size = 15;
  const height = 15 * 0.2;
  const walls = createWalls(size, height);

  const paintingsRef = useRef<Set<THREE.Mesh>>(new Set());
  const registerPainting = (mesh: THREE.Mesh) => {
    paintingsRef.current.add(mesh);
  };
  const unregisterPainting = (mesh: THREE.Mesh) => {
    paintingsRef.current.delete(mesh);
  };

  useFrame(({ camera }) => {
    let visibleId: number | null = null;

    const camDir = new THREE.Vector3();
    camera.getWorldDirection(camDir);

    paintingsRef.current.forEach((mesh) => {
      const paintingPos = new THREE.Vector3();
      mesh.getWorldPosition(paintingPos);

      const distance = camera.position.distanceTo(paintingPos);

      const camToPainting = paintingPos
        .clone()
        .sub(camera.position)
        .normalize();
      const dot = camDir.dot(camToPainting);

      const isVisible = dot > 0.9 && distance < 4;

      if (isVisible) {
        visibleId = mesh.userData.id;
      }
    });

    setIsModalOpen(visibleId);
  });
  return (
    <>
      {/* floor */}
      <mesh rotation={[-Math.PI / 2, 0, 0]} receiveShadow>
        <planeGeometry args={[size, size]} />
        <meshStandardMaterial color="#9E815D" />
      </mesh>
      {/* walls */}
      {walls.map((wall, i) => {
        return (
          <group key={i} position={wall.pos} rotation={wall.rot}>
            <mesh>
              <boxGeometry args={wall.boxSize} />
              <meshStandardMaterial color={wall.color} />
            </mesh>

            {init.slice(i * 3, i * 3 + 3).map((painting, i) => {
              const gap = size / (3 + 1);
              const x = -size / 2 + gap * (i + 1);

              return (
                <Painting
                  key={i}
                  register={registerPainting}
                  unregister={unregisterPainting}
                  paintingDetails={painting}
                  x={x}
                />
              );
            })}
          </group>
        );
      })}
      {/*ceiling*/}
      <mesh rotation={[Math.PI / 2, 0, 0]} position={[0, height, 0]}>
        <planeGeometry args={[size, size]} />
        <meshStandardMaterial color="#ffffff" />
      </mesh>
    </>
  );
}
