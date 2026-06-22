import { useEffect, useRef } from 'react';
import {
  CanvasTexture,
  Group,
  Mesh,
  MeshStandardMaterial,
  RepeatWrapping,
  SRGBColorSpace,
  Texture,
  Vector3,
  VideoTexture,
} from 'three';
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

type VideoData = { video: HTMLVideoElement; texture: VideoTexture };

// 골드 프레임 위를 흐르는 빛 띠(그라데이션) emissive 텍스처
function createGoldSweepTexture() {
  const canvas = document.createElement('canvas');
  canvas.width = 256;
  canvas.height = 1;
  const ctx = canvas.getContext('2d')!;
  const grad = ctx.createLinearGradient(0, 0, 256, 0);
  grad.addColorStop(0, '#221500');
  grad.addColorStop(0.35, '#553a00');
  grad.addColorStop(0.5, '#ffe9a8'); // 하이라이트 띠
  grad.addColorStop(0.65, '#553a00');
  grad.addColorStop(1, '#221500');
  ctx.fillStyle = grad;
  ctx.fillRect(0, 0, 256, 1);
  const tex = new CanvasTexture(canvas);
  tex.wrapS = RepeatWrapping;
  tex.wrapT = RepeatWrapping;
  return tex;
}

// 영상 작품 ▶ 배지 텍스처 (원형 + 흰 삼각형). 모든 작품이 공유 — 1회만 생성
let playBadgeTexture: CanvasTexture | null = null;
function getPlayBadgeTexture() {
  if (playBadgeTexture) return playBadgeTexture;
  const canvas = document.createElement('canvas');
  canvas.width = 64;
  canvas.height = 64;
  const ctx = canvas.getContext('2d')!;
  ctx.beginPath();
  ctx.arc(32, 32, 30, 0, Math.PI * 2);
  ctx.fillStyle = 'rgba(0,0,0,0.5)';
  ctx.fill();
  ctx.beginPath();
  ctx.moveTo(26, 19);
  ctx.lineTo(47, 32);
  ctx.lineTo(26, 45);
  ctx.closePath();
  ctx.fillStyle = '#ffffff';
  ctx.fill();
  const tex = new CanvasTexture(canvas);
  tex.colorSpace = SRGBColorSpace;
  playBadgeTexture = tex;
  return tex;
}

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
  const meshRef = useRef<Mesh>(null);
  const frameMatRef = useRef<MeshStandardMaterial>(null);
  const worldPosRef = useRef(new Vector3());
  const isNearRef = useRef(false);
  const mountedAtRef = useRef(0);
  const videoDataRef = useRef<VideoData | null>(null);
  const sweepTextureRef = useRef<CanvasTexture | null>(null);

  // 영상 작품 전용 골드 sweep 텍스처 생성 후 프레임 emissiveMap에 연결
  useEffect(() => {
    if (!videoUrl) return;
    const tex = createGoldSweepTexture();
    sweepTextureRef.current = tex;
    const mat = frameMatRef.current;
    if (mat) {
      mat.emissiveMap = tex;
      mat.needsUpdate = true;
    }
    return () => {
      sweepTextureRef.current = null;
      if (mat) mat.emissiveMap = null;
      tex.dispose();
    };
  }, [videoUrl]);

  useEffect(() => {
    mountedAtRef.current = Date.now();
    if (!videoUrl) return;
    const video = document.createElement('video');
    video.crossOrigin = 'anonymous';
    video.src = videoUrl;
    video.loop = true;
    video.muted = true;
    video.playsInline = true;
    video.preload = 'auto';
    const texture = new VideoTexture(video);
    texture.colorSpace = SRGBColorSpace;
    videoDataRef.current = { video, texture };
    video.load();
    video.play().catch(() => {});
    return () => {
      video.pause();
      texture.dispose();
      videoDataRef.current = null;
    };
  }, [videoUrl]);

  useFrame(({ camera, clock }) => {
    if (!videoUrl) return;

    // 영상 작품 프레임: 빛 띠(그라데이션)가 프레임을 따라 흐르고
    // 전체 밝기도 은은하게 맥동
    if (frameMatRef.current) {
      const t = clock.elapsedTime;
      if (sweepTextureRef.current) {
        sweepTextureRef.current.offset.x = -t * 0.3;
      }
      frameMatRef.current.emissiveIntensity = 1.1 + Math.sin(t * 2.2) * 0.25;
    }

    const videoData = videoDataRef.current;
    if (!localRef.current || !meshRef.current) return;
    localRef.current.getWorldPosition(worldPosRef.current);
    const near =
      camera.position.distanceTo(worldPosRef.current) < VIDEO_NEAR_THRESHOLD;

    if (videoData) {
      const videoReady = videoData.video.readyState >= 3;
      const shouldShow = near && videoReady;

      const warmedUp = Date.now() - mountedAtRef.current > 3000;
      if (near && videoData.video.paused) {
        videoData.video.play().catch(() => {});
      } else if (!near && !videoData.video.paused && warmedUp) {
        videoData.video.pause();
      }

      if (shouldShow !== isNearRef.current) {
        isNearRef.current = shouldShow;
        const mat = meshRef.current.material as MeshStandardMaterial;
        mat.map = shouldShow ? videoData.texture : img;
        mat.needsUpdate = true;
      }

      if (isNearRef.current && videoData.video.readyState >= 2) {
        videoData.texture.needsUpdate = true;
      }
    }
  });

  const [imgW, imgH] = checkImgSize(img, w, h, 0.4);

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
      {/* 외부 프레임 — 영상 변환 작품은 두꺼운 황금 메탈 프레임으로 멀리서도 구분 */}
      <mesh>
        <boxGeometry
          args={[
            imgW + (videoUrl ? FRAME_M * 2.6 : FRAME_M * 2),
            imgH + (videoUrl ? FRAME_M * 2.6 : FRAME_M * 2),
            FRAME_D,
          ]}
        />
        {videoUrl ? (
          <meshStandardMaterial
            ref={frameMatRef}
            color="#FFD24A"
            emissive="#FFAA00"
            emissiveIntensity={0.9}
            roughness={0.18}
            metalness={0.85}
          />
        ) : (
          <meshStandardMaterial
            color="#2C2926"
            roughness={0.3}
            metalness={0.08}
          />
        )}
      </mesh>

      {/* 매트 보드 */}
      <mesh position={[0, 0, matZ]}>
        <boxGeometry args={[imgW + MAT_M * 2, imgH + MAT_M * 2, MAT_D]} />
        <meshStandardMaterial color="#EDE8DC" roughness={0.9} />
      </mesh>

      {/* 작품 이미지 */}
      <mesh ref={meshRef} position={[0, 0, imgZ]}>
        <planeGeometry args={[imgW, imgH]} />
        <meshStandardMaterial map={img} />
      </mesh>

      {/* 영상 변환 작품 ▶ 배지 — 액자 우하단 모서리.
          Html이 아닌 실제 3D 메시라 깊이 테스트로 벽이 자동으로 가림 (레이캐스팅 없음) */}
      {videoUrl && (
        <mesh position={[imgW / 2 + FRAME_M, -imgH / 2 - FRAME_M, 0.12]}>
          <planeGeometry args={[0.22, 0.22]} />
          <meshBasicMaterial
            map={getPlayBadgeTexture()}
            transparent
            depthWrite={false}
            toneMapped={false}
          />
        </mesh>
      )}

      {/* 작품 정보 */}
      <Html
        ref={htmlRef}
        transform
        position={[0, -h / 2 + 0.8, 0.13]}
        distanceFactor={2}
        center
        // 모달(z-100)·HUD(z-40)보다 항상 아래에 깔리도록 제한
        zIndexRange={[30, 0]}
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
