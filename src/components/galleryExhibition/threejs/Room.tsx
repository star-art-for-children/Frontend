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
  const tempCurrentForward = useRef(new Vector3());

  const prevPos = useRef(new Vector3());
  const prevDir = useRef(new Vector3());

  const tempPos = useRef(new Vector3());
  const tempDir = useRef(new Vector3());

  const closestPaintingRef = useRef<GalleryUIArtworkProps | null>(null);

  useEffect(() => {
    const postLikes = async () => {
      const painting = closestPaintingRef.current;
      if (!painting || loading) return;

      const closestId = painting.id;

      let prevArtworks;
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
        setArtworks(prevArtworks || []);
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

      const closestPaintingVisible = fovDot > 0.5 && distance < 5;

      if (closestPaintingVisible) {
        const score = fovDot * 20 - distance * 10;

        if (score > bestScore) {
          bestScore = score;
          bestIndex = i;
        }
      }
    }

    closestPaintingRef.current = bestIndex !== -1 ? artworks[bestIndex] : null;

    prevPos.current.copy(camera.position);
    prevDir.current.copy(forward);
  });
  return (
    <>
      <Floor size={size} />

      <Walls walls={walls} />

      <InnerWalls
        walls={innerWalls}
        init={artworks}
        paintingTextures={paintingTextures}
        paintingRefs={paintingRefs}
      />

      <Ceiling size={size} height={height} />
    </>
  );
}
