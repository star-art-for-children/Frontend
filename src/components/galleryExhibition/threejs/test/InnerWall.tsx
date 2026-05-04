import React from 'react';
import { PaintingType, WAllType } from '../../../../types/gallery';
import Painting from '@/components/galleryExhibition/threejs/test/Painting';
import { Texture } from 'three';

export default function InnerWalls({
  paintingTextures,
  init,
  walls,
  showPaint,
}: {
  paintingTextures: Texture[];
  init: PaintingType[];
  walls: WAllType[];
  showPaint: boolean[];
}) {
  return (
    <>
      {walls.map((wall, i) => {
        const [w, h, d] = wall.boxSize;

        return (
          <group key={i} position={wall.pos} rotation={wall.rot}>
            <mesh>
              <boxGeometry args={[w, h, d]} />
              <meshStandardMaterial color="#E6E0D6" />
            </mesh>

            <Painting
              visible={showPaint[i]}
              img={paintingTextures[i]}
              details={init[i]}
              weight={w}
              height={h}
            />
          </group>
        );
      })}
    </>
  );
}
