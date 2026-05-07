import React, { useEffect, useMemo, useRef } from 'react';
import { PaintingType, WAllType } from '../../../../types/gallery';
import { useTexture } from '@react-three/drei';
import Floor from '@/components/galleryExhibition/threejs/test/Floor';
import Ceiling from '@/components/galleryExhibition/threejs/test/Ceiling';
import Walls from '@/components/galleryExhibition/threejs/test/Walls';
import InnerWalls from '@/components/galleryExhibition/threejs/test/InnerWall';
import { useFrame } from '@react-three/fiber';
import { Group, Vector3 } from 'three';
import { downloadImgHandler } from '@/components/galleryExhibition/threejs/test/util/util';

export default function Room({
  init,
  size,
  height,
  walls,
  innerWalls,
}: {
  init: PaintingType[];
  size: number;
  height: number;
  walls: WAllType[];
  innerWalls: WAllType[];
}) {
  const urls = useMemo(() => init.map((x) => x.paintingUrl), [init]);

  const paintingTextures = useTexture(urls);
  const paintingRefs = useRef<(Group | null)[]>([]);
  const tempCurrentForward = useRef(new Vector3());

  const prevPos = useRef(new Vector3());
  const prevDir = useRef(new Vector3());

  const tempPos = useRef(new Vector3());
  const tempDir = useRef(new Vector3());

  const closestPaintingRef = useRef<PaintingType | null>(null);

  useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      const painting = closestPaintingRef.current;

      if (!painting) return;

      if (e.key === '1') {
        console.log('like', painting.title);
      }

      if (e.key === '2') {
        console.log(painting);
        downloadImgHandler(painting.paintingUrl, painting.title);
      }
    };

    window.addEventListener('keydown', handler);

    return () => {
      window.removeEventListener('keydown', handler);
    };
  }, []);

  useFrame(({ camera }) => {
    camera.getWorldDirection(tempCurrentForward.current);

    const forward = tempCurrentForward.current;

    const moved = prevPos.current.distanceTo(camera.position) > 0.1;

    const rotated = 1 - prevDir.current.dot(forward) > 0.01;

    if (!moved && !rotated) return;

    let bestIndex = -1;
    let bestScore = -Infinity;

    for (let i = 0; i < innerWalls.length; i++) {
      const mesh = paintingRefs.current[i];

      if (!mesh) continue;

      mesh.getWorldPosition(tempPos.current);

      tempDir.current.copy(tempPos.current).sub(camera.position);

      const distance = tempDir.current.length();

      tempDir.current.normalize();

      const fovDot = forward.dot(tempDir.current);

      //소규모니까 그냥 전부 보이게
      // const paintingVisible = fovDot > 0.7;
      // mesh.visible = paintingVisible;

      const closestPaintingVisible = fovDot > 0.7 && distance < 7;

      if (closestPaintingVisible) {
        const score = fovDot * 100 - distance;

        if (score > bestScore) {
          bestScore = score;
          bestIndex = i;
        }
      }
    }

    closestPaintingRef.current = bestIndex !== -1 ? init[bestIndex] : null;

    prevPos.current.copy(camera.position);
    prevDir.current.copy(forward);
  });
  return (
    <>
      <Floor size={size} />

      <Walls walls={walls} />

      <InnerWalls
        walls={innerWalls}
        init={init}
        paintingTextures={paintingTextures}
        paintingRefs={paintingRefs}
      />

      <Ceiling size={size} height={height} />
    </>
  );
}
