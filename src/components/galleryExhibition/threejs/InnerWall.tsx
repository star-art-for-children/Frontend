import React from 'react';
import { GalleryUIArtworkProps, WAllType } from '../../../types/gallery';
import { Group, Texture } from 'three';
import Painting from '@/components/galleryExhibition/threejs/Painting';

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
        const paintingDetails = init[i];
        return (
          <group key={i} position={wall.pos} rotation={wall.rot}>
            <mesh>
              <boxGeometry args={[w, h, d]} />
              <meshStandardMaterial color="#E6E0D6" />
            </mesh>
            {paintingDetails && (
              <Painting
                img={paintingTextures[i]}
                paintingRef={(el) => {
                  paintingRefs.current[i] = el;
                }}
                details={paintingDetails}
                weight={w}
                height={h}
              />
            )}
          </group>
        );
      })}
    </>
  );
}
