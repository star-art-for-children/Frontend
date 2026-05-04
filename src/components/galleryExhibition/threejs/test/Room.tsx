import React, { useEffect, useMemo, useRef, useState } from 'react';
import { PaintingType, WAllType } from '../../../../types/gallery';
import { useTexture } from '@react-three/drei';
import Floor from '@/components/galleryExhibition/threejs/test/Floor';
import Ceiling from '@/components/galleryExhibition/threejs/test/Ceiling';
import Walls from '@/components/galleryExhibition/threejs/test/Walls';
import InnerWalls from '@/components/galleryExhibition/threejs/test/InnerWall';
import { useFrame, useThree } from '@react-three/fiber';
import { Vector3 } from 'three';

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

  const camera = useThree((s) => s.camera.position);
  const prevPos = useRef(camera.clone());

  const [ready, setReady] = useState(false);

  const [visiblePaints, setVisiblePaints] = useState<boolean[]>(
    new Array(innerWalls.length).fill(false)
  );

  const innerWallPos = useMemo(
    () => innerWalls.map((x) => new Vector3(...x.pos)),
    [innerWalls]
  );

  useEffect(() => {
    const id = requestAnimationFrame(() => {
      setReady(true);
    });
    return () => cancelAnimationFrame(id);
  }, []);

  useFrame(({ camera }) => {
    if (!ready) return;

    const moved = prevPos.current.distanceTo(camera.position);
    if (moved < 0.1) return;

    const forward = camera.getWorldDirection(new Vector3());
    const next = new Array(innerWalls.length).fill(false);

    innerWalls.forEach((_, i) => {
      const pos = innerWallPos[i];

      const dir = pos.clone().sub(camera.position).normalize();
      const fovDot = forward.dot(dir);

      // console.log(fovDot,i)
      if (fovDot > 0.7) {
        next[i] = true;
      }
    });

    prevPos.current.copy(camera.position);
    setVisiblePaints((prev) => {
      const same = prev.every((v, i) => v === next[i]);
      return same ? prev : next;
    });
  });

  return (
    <>
      <Floor size={size} />

      <Walls walls={walls} />

      <InnerWalls
        walls={innerWalls}
        showPaint={
          ready ? visiblePaints : new Array(innerWalls.length).fill(true)
        }
        init={init}
        paintingTextures={paintingTextures}
      />

      <Ceiling size={size} height={height} />
    </>
  );
}
