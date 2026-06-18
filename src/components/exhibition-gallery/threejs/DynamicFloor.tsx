import { useEffect, useMemo } from 'react';
import { useTexture } from '@react-three/drei';
import { MeshReflectorMaterial } from '@react-three/drei';
import { RepeatWrapping } from 'three';
import { FloorConfig } from '@/types/gallery-theme';
import { FLOOR_PATTERNS } from '@/lib/gallery/floorPatterns';

export default function DynamicFloor({
  size,
  config,
}: {
  size: number;
  config: FloorConfig;
}) {
  const spec = config.pattern ? FLOOR_PATTERNS[config.pattern] : undefined;

  // useTexture는 hook 규칙상 항상 호출해야 한다. 이미지 패턴이 아니어도
  // 기본 경로를 로드(url 기준 캐시되어 저렴)하고, map 계산에서는 사용하지 않는다.
  const imageUrl =
    spec?.source.type === 'image' ? spec.source.url : '/gallery/floor.webp';
  const texture = useTexture(imageUrl);

  const map = useMemo(() => {
    if (!spec) return null;
    const t =
      spec.source.type === 'image'
        ? texture.clone()
        : spec.source.generator(config.color);
    if (!t) return null;
    t.wrapS = RepeatWrapping;
    t.wrapT = RepeatWrapping;
    t.repeat.set(size / spec.repeatDivisor, size / spec.repeatDivisor);
    t.needsUpdate = true;
    return t;
  }, [spec, texture, size, config.color]);

  useEffect(() => {
    // 절차 생성 텍스처만 정리한다. (이미지는 useTexture 캐시를 공유)
    if (spec?.source.type !== 'procedural') return;
    return () => {
      map?.dispose();
    };
  }, [map, spec]);

  const materialColor = spec?.tintWhite ? '#FFFFFF' : config.color;

  return (
    <mesh rotation={[-Math.PI / 2, 0, 0]} receiveShadow>
      <planeGeometry args={[size, size]} />
      {spec?.reflective === false ? (
        <meshStandardMaterial
          map={map}
          color={materialColor}
          roughness={config.roughness}
          metalness={config.metalness}
        />
      ) : (
        <MeshReflectorMaterial
          map={map}
          color={materialColor}
          blur={config.blur as [number, number]}
          resolution={512}
          mixBlur={spec?.mixBlur ?? 1.0}
          mixStrength={spec?.mixStrength ?? 1.2}
          roughness={config.roughness}
          depthScale={0.5}
          minDepthThreshold={0.4}
          maxDepthThreshold={1.0}
          metalness={config.metalness}
          mirror={config.mirror}
        />
      )}
    </mesh>
  );
}
