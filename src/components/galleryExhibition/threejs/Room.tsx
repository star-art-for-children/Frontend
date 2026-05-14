import React, { useEffect, useMemo, useRef, useState } from 'react';
import { GalleryUIArtworkProps, WAllType } from '../../../types/gallery';
import { useTexture } from '@react-three/drei';
import { useFrame } from '@react-three/fiber';
import { Group, Vector3 } from 'three';
import { likesToggle } from '@/service/artworks';
import { downloadImgHandler } from '@/lib/gallery/image';
import Floor from '@/components/galleryExhibition/threejs/Floor';
import Walls from '@/components/galleryExhibition/threejs/Walls';
import InnerWalls from '@/components/galleryExhibition/threejs/InnerWall';
import Ceiling from '@/components/galleryExhibition/threejs/Ceiling';
import { User } from '@supabase/supabase-js';

export default function Room({
  init,
  size,
  height,
  walls,
  innerWalls,
  exhibitionId,
  user,
}: {
  init: GalleryUIArtworkProps[];
  size: number;
  height: number;
  walls: WAllType[];
  innerWalls: WAllType[];
  exhibitionId: string;
  user: User | null;
}) {
  const [artworks, setArtworks] = useState(init);
  const [loading, setLoading] = useState(false);

  const urls = useMemo(() => artworks.map((x) => x.image_url), [artworks]);
  const paintingTextures = useTexture(urls);

  const paintingRefs = useRef<(Group | null)[]>([]);
  const htmlRefs = useRef<(HTMLDivElement | null)[]>([]);

  const tempForward = useRef(new Vector3());
  const tempPos = useRef(new Vector3());
  const tempDir = useRef(new Vector3());

  const prevPos = useRef(new Vector3());
  const prevDir = useRef(new Vector3());

  const prevIndexRef = useRef<number>(-1);

  const closestPaintingRef = useRef<GalleryUIArtworkProps | null>(null);

  useFrame(({ camera }) => {
    camera.getWorldDirection(tempForward.current);
    const forward = tempForward.current;

    const moved = prevPos.current.distanceToSquared(camera.position) > 0.01;
    const rotated = 1 - prevDir.current.dot(forward) > 0.01;

    if (!moved && !rotated) return;

    let bestIndex = -1;
    let bestScore = -Infinity;

    for (let i = 0; i < artworks.length; i++) {
      const mesh = paintingRefs.current[i];
      if (!mesh) continue;

      mesh.getWorldPosition(tempPos.current);

      tempDir.current.copy(tempPos.current).sub(camera.position);

      const distanceSq = tempDir.current.lengthSq();

      tempDir.current.normalize();

      const fovDot = forward.dot(tempDir.current);

      if (fovDot < 0.5 || distanceSq > 25) continue;

      const score = fovDot * 20 - Math.sqrt(distanceSq) * 10;

      if (score > bestScore) {
        bestScore = score;
        bestIndex = i;
      }
    }

    if (prevIndexRef.current !== bestIndex) {
      if (prevIndexRef.current !== -1) {
        const prevHtml = htmlRefs.current[prevIndexRef.current];
        if (prevHtml) {
          prevHtml.style.opacity = '0';
        }
      }

      if (bestIndex !== -1) {
        const nextHtml = htmlRefs.current[bestIndex];
        if (nextHtml) {
          nextHtml.style.opacity = '1';
        }
      }

      prevIndexRef.current = bestIndex;
    }

    closestPaintingRef.current = bestIndex !== -1 ? artworks[bestIndex] : null;

    prevPos.current.copy(camera.position);
    prevDir.current.copy(forward);
  });

  useEffect(() => {
    const postLikes = async () => {
      const painting = closestPaintingRef.current;
      if (!painting || loading) return;

      const closestId = painting.id;

      let prevArtworks: GalleryUIArtworkProps[];

      setArtworks((prev) => {
        prevArtworks = [...prev];

        return prev.map((x) =>
          x.id === closestId
            ? {
                ...x,
                likesByMe: !x.likesByMe,
                likes: x.likesByMe ? x.likes - 1 : x.likes + 1,
              }
            : x
        );
      });

      setLoading(true);

      try {
        await likesToggle(exhibitionId, closestId);
      } catch (e) {
        console.log(e);
        setArtworks(prevArtworks!);
      } finally {
        setLoading(false);
      }
    };

    const handler = (e: KeyboardEvent) => {
      const painting = closestPaintingRef.current;
      if (!painting) return;

      if (e.key === '1') {
        if (!user) return;
        postLikes();
      }

      if (e.key === '2') {
        downloadImgHandler(painting.image_url, painting.title);
      }
    };

    window.addEventListener('keydown', handler);

    return () => {
      window.removeEventListener('keydown', handler);
    };
  }, [loading, exhibitionId, user]);

  return (
    <>
      <Floor size={size} />

      <Walls walls={walls} />

      <InnerWalls
        walls={innerWalls}
        init={artworks}
        paintingTextures={paintingTextures}
        paintingRefs={paintingRefs}
        htmlRefs={htmlRefs}
      />

      <Ceiling size={size} height={height} />
    </>
  );
}
