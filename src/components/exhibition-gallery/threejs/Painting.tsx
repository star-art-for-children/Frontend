import { useEffect, useMemo, useRef, useState } from 'react';
import { Group, Texture, Vector3, VideoTexture } from 'three';
import { useFrame } from '@react-three/fiber';
import { Html } from '@react-three/drei';
import { Download, Heart } from 'lucide-react';
import { checkImgSize } from '@/lib/gallery/image';
import { GalleryUIArtworkProps } from '@/types/gallery';

const FRAME_M = 0.09;
const MAT_M = 0.035;
const FRAME_D = 0.06;
const MAT_D = 0.035;
const VIDEO_NEAR_THRESHOLD = 5;

export default function Painting({
  img,
  details,
  w,
  h,
  paintingRef,
  htmlRef,
  videoUrl,
}: {
  img: Texture;
  details: GalleryUIArtworkProps;
  w: number;
  h: number;
  paintingRef?: (mesh: Group | null) => void;
  htmlRef?: (el: HTMLDivElement | null) => void;
  videoUrl?: string | null;
}) {
  const localRef = useRef<Group>(null);
  const isNearRef = useRef(false);
  const [isNear, setIsNear] = useState(false);

  const videoData = useMemo(() => {
    if (!videoUrl) return null;
    const video = document.createElement('video');
    video.crossOrigin = 'anonymous';
    video.src = videoUrl;
    video.loop = true;
    video.muted = true;
    video.playsInline = true;
    return { video, texture: new VideoTexture(video) };
  }, [videoUrl]);

  useEffect(() => {
    return () => {
      videoData?.video.pause();
      videoData?.texture.dispose();
    };
  }, [videoData]);

  useFrame(({ camera }) => {
    if (!localRef.current || !videoData) return;
    const worldPos = new Vector3();
    localRef.current.getWorldPosition(worldPos);
    const near = camera.position.distanceTo(worldPos) < VIDEO_NEAR_THRESHOLD;
    if (near !== isNearRef.current) {
      isNearRef.current = near;
      setIsNear(near);
      if (near) {
        videoData.video.play().catch(() => {});
      } else {
        videoData.video.pause();
      }
    }
  });

  const displayTexture = isNear && videoData ? videoData.texture : img;
  const [imgW, imgH] = checkImgSize(displayTexture, w, h, 0.4);

  if (!details) return null;

  const matZ = FRAME_D / 2 + 0.004;
  const imgZ = matZ + MAT_D / 2 + 0.006;

  return (
    <group
      ref={(el) => {
        localRef.current = el;
        paintingRef?.(el);
      }}
      position={[0, 0, 0.3]}
    >
      {/* 외부 프레임 */}
      <mesh>
        <boxGeometry args={[imgW + FRAME_M * 2, imgH + FRAME_M * 2, FRAME_D]} />
        <meshStandardMaterial
          color="#2C2926"
          roughness={0.3}
          metalness={0.08}
        />
      </mesh>

      {/* 매트 보드 */}
      <mesh position={[0, 0, matZ]}>
        <boxGeometry args={[imgW + MAT_M * 2, imgH + MAT_M * 2, MAT_D]} />
        <meshStandardMaterial color="#EDE8DC" roughness={0.9} />
      </mesh>

      {/* 작품 이미지 */}
      <mesh position={[0, 0, imgZ]}>
        <planeGeometry args={[imgW, imgH]} />
        <meshStandardMaterial map={displayTexture} />
      </mesh>

      {/* 작품 정보 */}
      <Html
        ref={htmlRef}
        transform
        position={[0, -h / 2 + 0.8, 0.13]}
        distanceFactor={2}
        center
        style={{
          opacity: 0,
          pointerEvents: 'none',
          transition: 'opacity 0.4s ease, transform 0.4s ease',
          willChange: 'opacity, transform',
        }}
      >
        <div className="gap flex max-w-100 min-w-80 flex-col gap-1 font-bold text-white">
          <h1 className="text-[40px]">{details.title}</h1>
          <h1 className="text-[20px]">{details.artist_name}</h1>
          <p className="text-[15px] text-wrap text-gray-200">
            {details.description}
          </p>
          <div className="mt-1 flex justify-end gap-2 text-gray-200">
            <div className="flex gap-1">
              <Heart fill={details.likesByMe ? '#e68181' : 'none'} />
              <p>{details.likes}</p>
            </div>
            <Download />
          </div>
        </div>
      </Html>
    </group>
  );
}
