import React, { useMemo, useRef, useState } from 'react';
import { PaintingType, WAllType } from '../../../../types/gallery';
import { useTexture } from '@react-three/drei';
import Floor from '@/components/galleryExhibition/threejs/test/Floor';
import Ceiling from '@/components/galleryExhibition/threejs/test/Ceiling';
import Walls from '@/components/galleryExhibition/threejs/test/Walls';
import InnerWalls from '@/components/galleryExhibition/threejs/test/InnerWall';
import { useFrame } from '@react-three/fiber';
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

  const prevPos = useRef(new Vector3());
  const prevDir = useRef(new Vector3());
  const syncTimer = useRef(0);
  const nextRef = useRef<boolean[]>(new Array(innerWalls.length).fill(false));

  const [visiblePaints, setVisiblePaints] = useState<boolean[]>(
    new Array(innerWalls.length).fill(false)
  );

  const innerWallPos = useMemo(
    () => innerWalls.map((x) => new Vector3(...x.pos)),
    [innerWalls]
  );

  useFrame(({ camera }) => {
    const forward = camera.getWorldDirection(new Vector3());

    const moved = prevPos.current.distanceTo(camera.position) > 0.1;

    const rotated = 1 - prevDir.current.dot(forward) > 0.01;

    if (!moved && !rotated) return;

    const next = nextRef.current;
    next.fill(false);

    for (let i = 0; i < innerWalls.length; i++) {
      const pos = innerWallPos[i];

      const dir = pos.clone().sub(camera.position).normalize();

      const fovDot = forward.dot(dir);

      next[i] = fovDot > 0.7;
    }

    const now = performance.now();

    if (now - syncTimer.current > 100) {
      setVisiblePaints((prev) => {
        const same = prev.every((v, i) => v === next[i]);

        return same ? prev : [...next];
      });

      prevPos.current.copy(camera.position);
      prevDir.current.copy(forward);

      syncTimer.current = now;
    }
  });

  return (
    <>
      <Floor size={size} />

      <Walls walls={walls} />

      <InnerWalls
        walls={innerWalls}
        showPaint={visiblePaints}
        init={init}
        paintingTextures={paintingTextures}
      />

      <Ceiling size={size} height={height} />
    </>
  );
}
