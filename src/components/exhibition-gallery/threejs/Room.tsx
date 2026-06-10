import React, { useEffect, useMemo, useRef, useState } from 'react';
import { useTexture } from '@react-three/drei';
import { useFrame } from '@react-three/fiber';
import { Group, Quaternion, RepeatWrapping, Vector3 } from 'three';
import { likesToggle, collectStamp } from '@/lib/artwork/service';
import { useImageDownload } from '@/hooks/useImageDownload';

import { useRouter } from 'next/navigation';
import { GalleryUIArtworkProps, WAllType } from '@/types/gallery';
import { FloorConfig, WallPatternConfig } from '@/types/gallery-theme';
import { WALL_PATTERNS } from '@/lib/gallery/wallPatterns';
import { defaultPreset } from '@/lib/gallery/presets';
import InnerWalls from '@/components/exhibition-gallery/threejs/InnerWall';
import Walls from '@/components/exhibition-gallery/threejs/Walls';
import DynamicFloor from '@/components/exhibition-gallery/threejs/DynamicFloor';

export default function Room({
  init,
  size,
  walls,
  innerWalls,
  exhibitionId,
  canLikes,
  canStamp = false,
  onStampProgress,
  floorConfig = defaultPreset.floor,
  wallColor = defaultPreset.wallColor,
  wallPattern,
}: {
  init: GalleryUIArtworkProps[];
  size: number;
  height: number;
  walls: WAllType[];
  innerWalls: WAllType[];
  exhibitionId: string;
  canLikes: boolean;
  canStamp?: boolean;
  onStampProgress?: (collected: number, total: number) => void;
  floorConfig?: FloorConfig;
  wallColor?: string;
  wallPattern?: WallPatternConfig;
}) {
  const [artworks, setArtworks] = useState(init);
  const loadingRef = useRef(false);
  const stampLoadingRef = useRef(false);
  const urls = useMemo(() => artworks.map((x) => x.image_url), [artworks]);
  const paintingTextures = useTexture(urls);

  // 벽 패턴 텍스처는 한 번만 생성해 외벽/내벽이 공유한다.
  const wallTexture = useMemo(() => {
    if (!wallPattern) return null;
    const spec = WALL_PATTERNS[wallPattern.pattern];
    if (!spec) return null;
    const t = spec.generator(wallPattern.baseColor ?? wallColor);
    if (!t) return null;
    const [rx, ry] = wallPattern.repeat ?? spec.defaultRepeat;
    t.wrapS = RepeatWrapping;
    t.wrapT = RepeatWrapping;
    t.repeat.set(rx, ry);
    t.needsUpdate = true;
    return t;
  }, [wallPattern, wallColor]);

  useEffect(() => {
    return () => {
      wallTexture?.dispose();
    };
  }, [wallTexture]);

  const paintingRefs = useRef<(Group | null)[]>([]);
  const htmlRefs = useRef<(HTMLDivElement | null)[]>([]);

  const tempForward = useRef(new Vector3());
  const tempPos = useRef(new Vector3());
  const tempDir = useRef(new Vector3());

  const tempQuat = useRef(new Quaternion());
  const tempNormal = useRef(new Vector3());

  const prevPos = useRef(new Vector3());
  const prevDir = useRef(new Vector3());

  const prevIndexRef = useRef<number>(-1);

  const closestPaintingRef = useRef<GalleryUIArtworkProps | null>(null);
  const router = useRouter();
  const { download } = useImageDownload();

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

      if (fovDot < 0.5 || distanceSq > 35) continue;

      // 그림의 앞면(+Z 월드 노말)과 카메라 방향 비교 — 뒷면이면 스킵
      mesh.getWorldQuaternion(tempQuat.current);
      tempNormal.current.set(0, 0, 1).applyQuaternion(tempQuat.current);
      // tempDir은 카메라→그림 방향이므로, dot > 0이면 노말과 같은 방향 = 카메라가 뒷면
      if (tempNormal.current.dot(tempDir.current) > 0) continue;

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

  // 스탬프 수집 진행률을 상위(HUD)로 전달 — 초기 로드/새로고침 시에도 복원
  useEffect(() => {
    const collected = artworks.filter((x) => x.stampedByMe).length;
    onStampProgress?.(collected, artworks.length);
  }, [artworks, onStampProgress]);

  useEffect(() => {
    const postLikes = async () => {
      const painting = closestPaintingRef.current;
      if (!painting || loadingRef.current) return;

      const closestId = painting.id;

      let prevArtworks: GalleryUIArtworkProps[];
      loadingRef.current = true;
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

      try {
        await likesToggle(exhibitionId, closestId);

        router.refresh();
      } catch (e) {
        console.log(e);
        setArtworks(prevArtworks!);
      } finally {
        loadingRef.current = false;
      }
    };

    const postStamp = async () => {
      const painting = closestPaintingRef.current;
      if (!painting || stampLoadingRef.current) return;
      if (painting.stampedByMe) return; // 이미 수집한 그림

      const targetId = painting.id;
      stampLoadingRef.current = true;

      // 낙관적 업데이트
      setArtworks((prev) =>
        prev.map((x) => (x.id === targetId ? { ...x, stampedByMe: true } : x))
      );

      try {
        await collectStamp(exhibitionId, targetId);
      } catch (e) {
        console.log(e);
        // 실패 시 롤백
        setArtworks((prev) =>
          prev.map((x) =>
            x.id === targetId ? { ...x, stampedByMe: false } : x
          )
        );
      } finally {
        stampLoadingRef.current = false;
      }
    };

    const handler = (e: KeyboardEvent) => {
      if (!document.pointerLockElement) return;
      const painting = closestPaintingRef.current;
      if (!painting) return;

      if (e.key === '1') {
        if (!canLikes) return;
        postLikes();
      }

      if (e.key === '2') {
        download(painting.image_url, painting.title || 'image').catch((err) =>
          console.error('download fail', err)
        );
      }

      if (e.key === '3') {
        if (!canStamp) return;
        postStamp();
      }
    };

    window.addEventListener('keydown', handler);

    return () => {
      window.removeEventListener('keydown', handler);
    };
  }, [exhibitionId, canLikes, canStamp, router, download]);

  return (
    <>
      <DynamicFloor size={size} config={floorConfig} />
      <Walls walls={walls} wallTexture={wallTexture} />

      <InnerWalls
        walls={innerWalls}
        init={artworks}
        paintingTextures={paintingTextures}
        paintingRefs={paintingRefs}
        htmlRefs={htmlRefs}
        wallTexture={wallTexture}
      />
    </>
  );
}
