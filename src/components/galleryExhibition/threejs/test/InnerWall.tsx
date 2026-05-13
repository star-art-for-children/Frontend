import React from 'react';
import { GalleryUIArtworkProps, WAllType } from '../../../../types/gallery';
import Painting from '@/components/galleryExhibition/threejs/test/Painting';
import { Group, Texture } from 'three';

export default function InnerWalls({
  paintingTextures,
  init,
  walls,
  paintingRefs,
}: {
  paintingTextures: Texture[];
  init: GalleryUIArtworkProps[];
  walls: WAllType[];
  paintingRefs: React.RefObject<(Group | null)[]>;
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
              img={paintingTextures[i]}
              paintingRef={(el) => {
                paintingRefs.current[i] = el;
              }}
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
