import React from 'react';
import { Group, Texture } from 'three';
import Painting from './Painting';
import { GalleryUIArtworkProps, WAllType } from '@/types/gallery';

export default function InnerWalls({
  paintingTextures,
  init,
  walls,
  paintingRefs,
  htmlRefs,
  wallTexture = null,
}: {
  paintingTextures: Texture[];
  init: GalleryUIArtworkProps[];
  walls: WAllType[];
  paintingRefs: React.RefObject<(Group | null)[]>;
  htmlRefs: React.RefObject<(HTMLDivElement | null)[]>;
  wallTexture?: Texture | null;
}) {
  let interiorBackIdx = walls.length;
  const assignments = walls.map((wall, i) => ({
    frontIdx: i,
    backIdx: wall.isInterior ? interiorBackIdx++ : undefined,
  }));

  return (
    <>
      {walls.map((wall, i) => {
        const [w, wallH, d] = wall.boxSize;
        const front = assignments[i].frontIdx;
        const back = assignments[i].backIdx;

        return (
          <group key={i} position={wall.pos} rotation={wall.rot}>
            <mesh castShadow receiveShadow>
              <boxGeometry args={[w, wallH, d]} />
              <meshStandardMaterial
                color={wallTexture ? '#FFFFFF' : wall.color}
                map={wallTexture ?? undefined}
                roughness={0.85}
                metalness={0.02}
              />
            </mesh>

            {front < init.length && (
              <Painting
                img={paintingTextures[front]}
                details={init[front]}
                w={w}
                h={wallH}
                paintingRef={(el) => {
                  paintingRefs.current[front] = el;
                }}
                htmlRef={(el) => {
                  htmlRefs.current[front] = el;
                }}
              />
            )}

            {back !== undefined && back < init.length && (
              <group rotation={[0, Math.PI, 0]}>
                <Painting
                  img={paintingTextures[back]}
                  details={init[back]}
                  w={w}
                  h={wallH}
                  paintingRef={(el) => {
                    paintingRefs.current[back] = el;
                  }}
                  htmlRef={(el) => {
                    htmlRefs.current[back] = el;
                  }}
                />
              </group>
            )}
          </group>
        );
      })}
    </>
  );
}
