import React, { useEffect, useMemo } from 'react';
import { Sparkles } from '@react-three/drei';
import { Euler, Matrix4, Quaternion, Vector3 } from 'three';
import { GalleryPreset, ParticleConfig } from '@/types/gallery-theme';
import { WAllType } from '@/types/gallery';
import { MODEL_REGISTRY } from '@/lib/gallery/modelRegistry';
import FallingPetals from './particles/FallingPetals';
import FallingSnow from './particles/FallingSnow';
import FallingLeaves from './particles/FallingLeaves';
import RainDrops from './particles/RainDrops';

function sr(seed: number): number {
  const x = Math.sin(seed + 1) * 10000;
  return x - Math.floor(x);
}

function rr(seed: number, min: number, max: number): number {
  return min + sr(seed) * (max - min);
}

type WallBox = { inv: Matrix4; halfX: number; halfZ: number };

const _localPoint = new Vector3();

/** (x,z) 점이 margin만큼 부풀린 벽 박스 중 하나라도 안에 들어가면 true */
function overlapsAnyWall(
  x: number,
  z: number,
  margin: number,
  wallBoxes: WallBox[]
): boolean {
  for (const box of wallBoxes) {
    _localPoint.set(x, 0, z).applyMatrix4(box.inv);
    if (
      Math.abs(_localPoint.x) < box.halfX + margin &&
      Math.abs(_localPoint.z) < box.halfZ + margin
    ) {
      return true;
    }
  }
  return false;
}

function getCellCenters(size: number, cellSize: number): [number, number][] {
  const gridSize = Math.round(size / cellSize);
  const half = size / 2;
  const centers: [number, number][] = [];
  for (let x = 0; x < gridSize; x++) {
    for (let z = 0; z < gridSize; z++) {
      centers.push([
        -half + x * cellSize + cellSize / 2,
        -half + z * cellSize + cellSize / 2,
      ]);
    }
  }
  return centers;
}

function getPositions(
  placement:
    | 'corner'
    | 'scattered'
    | 'cell-center'
    | 'near-cell-center'
    | undefined,
  count: number,
  half: number,
  seedOffset: number,
  elevationMin = 0,
  elevationMax = 0,
  xRange?: [number, number],
  zRange?: [number, number],
  cellCenters?: [number, number][],
  cellCenterOffset = 0,
  nearCellRadius = 2,
  isBlocked?: (x: number, z: number) => boolean
): [number, number, number][] {
  if (
    placement === 'near-cell-center' &&
    cellCenters &&
    cellCenters.length > 0
  ) {
    return Array.from({ length: count }, (_, i) => {
      const center = cellCenters[i % cellCenters.length];
      const angle = rr(seedOffset + i * 3, 0, Math.PI * 2);
      const dist = rr(
        seedOffset + i * 3 + 1,
        nearCellRadius * 0.4,
        nearCellRadius
      );
      return [
        center[0] + Math.cos(angle) * dist,
        rr(seedOffset + i * 3 + 10, elevationMin, elevationMax),
        center[1] + Math.sin(angle) * dist,
      ] as [number, number, number];
    });
  }

  if (placement === 'cell-center' && cellCenters) {
    return cellCenters
      .slice(cellCenterOffset, cellCenterOffset + count)
      .map(([x, z], i) => [
        x,
        rr(seedOffset + i * 3 + 10, elevationMin, elevationMax),
        z,
      ]);
  }

  if (placement === 'corner' || (!placement && count <= 4)) {
    const o = 0.8;
    return (
      [
        [-half + o, 0, -half + o],
        [half - o, 0, -half + o],
        [-half + o, 0, half - o],
        [half - o, 0, half - o],
      ] as [number, number, number][]
    )
      .slice(0, count)
      .map(([x, , z], i) => [
        x,
        rr(seedOffset + i * 3 + 10, elevationMin, elevationMax),
        z,
      ]);
  }

  const inner = half * 0.8;
  const xMin = xRange ? xRange[0] : -inner;
  const xMax = xRange ? xRange[1] : inner;
  const zMin = zRange ? zRange[0] : -inner;
  const zMax = zRange ? zRange[1] : inner;

  const spanX = xMax - xMin;
  const spanZ = zMax - zMin;
  const isFixedPoint = spanX < 0.01 && spanZ < 0.01;

  return Array.from({ length: count }, (_, i) => {
    let x = rr(seedOffset + i * 3, xMin, xMax);
    let z = rr(seedOffset + i * 3 + 1, zMin, zMax);
    // 벽과 겹치면 다시 위치를 찾는다 (벽이 없으면 첫 시도 그대로 유지)
    if (isBlocked) {
      for (let a = 1; a <= 12 && isBlocked(x, z); a++) {
        if (isFixedPoint) {
          // 고정 점(예: 가운데 나무)이 막힘 → 황금각 나선으로 주변 빈 곳 탐색
          const r = a * 0.6;
          const ang = a * 2.399963;
          x = xMin + Math.cos(ang) * r;
          z = zMin + Math.sin(ang) * r;
        } else {
          x = rr(seedOffset + i * 3 + a * 97, xMin, xMax);
          z = rr(seedOffset + i * 3 + 1 + a * 97, zMin, zMax);
        }
      }
    }
    return [
      x,
      rr(seedOffset + i * 3 + 10, elevationMin, elevationMax),
      z,
    ] as [number, number, number];
  });
}

export type CircleCollider = { x: number; z: number; radius: number };

export default function DynamicDecorations({
  preset,
  size,
  height,
  cellSize = 12,
  gridSize = 1,
  innerWalls = [],
  onColliders,
}: {
  preset: GalleryPreset;
  size: number;
  height: number;
  cellSize?: number;
  gridSize?: number;
  innerWalls?: WAllType[];
  onColliders?: (colliders: CircleCollider[]) => void;
}) {
  const half = size / 2;
  // 내벽 박스를 로컬 좌표 변환용 역행렬로 미리 만들어 장식 배치 시 회피에 사용
  const wallBoxes = useMemo<WallBox[]>(
    () =>
      innerWalls.map((wall) => {
        const mat = new Matrix4().compose(
          new Vector3(...wall.pos),
          new Quaternion().setFromEuler(new Euler(...(wall.rot ?? [0, 0, 0]))),
          new Vector3(1, 1, 1)
        );
        return {
          inv: mat.invert(),
          halfX: wall.boxSize[0] / 2,
          halfZ: wall.boxSize[2] / 2,
        };
      }),
    [innerWalls]
  );
  const particleList = preset.particles
    ? Array.isArray(preset.particles)
      ? preset.particles
      : [preset.particles]
    : [];
  const cellCenters = useMemo(
    () => getCellCenters(size, cellSize),
    [size, cellSize]
  );
  const cellCount = gridSize * gridSize;

  const cellCenterOffsets = useMemo(
    () =>
      preset.decorations.map((_, i) =>
        preset.decorations
          .slice(0, i)
          .filter((cfg) => cfg.placement === 'cell-center')
          .reduce(
            (sum, cfg) =>
              sum +
              (cfg.countPerCell ? cfg.countPerCell * cellCount : cfg.count),
            0
          )
      ),
    [preset.decorations, cellCount]
  );

  const decorationGroups = useMemo(
    () =>
      preset.decorations.map((cfg, groupIdx) => {
        const entry = MODEL_REGISTRY[cfg.model];
        if (!entry) return null;

        const effectiveCount = cfg.countPerCell
          ? cfg.countPerCell * cellCount
          : cfg.count;

        const offset =
          cfg.placement === 'cell-center' ? cellCenterOffsets[groupIdx] : 0;

        // 모델 발자국(반경) 기준으로 벽을 피한다. 콜라이더 없는 작은 모델은 기본값 사용.
        const footprint = (entry.colliderRadius ?? 0.4) * cfg.scaleMax;
        const isBlocked =
          wallBoxes.length > 0
            ? (x: number, z: number) =>
                overlapsAnyWall(x, z, footprint, wallBoxes)
            : undefined;

        const positions = getPositions(
          cfg.placement,
          effectiveCount,
          half,
          groupIdx * 1000,
          cfg.elevationMin ?? 0,
          cfg.elevationMax ?? cfg.elevationMin ?? 0,
          cfg.xRange,
          cfg.zRange,
          cellCenters,
          offset,
          cfg.nearCellRadius ?? 2,
          isBlocked
        );

        return positions.map((pos, i) => {
          const userScale = rr(
            groupIdx * 1000 + i * 3 + 2,
            cfg.scaleMin,
            cfg.scaleMax
          );
          const finalScale = entry.baseScale * userScale;
          return {
            key: `${cfg.model}-${i}`,
            Component: entry.component,
            pos: [pos[0], pos[1] + entry.yOffset * finalScale, pos[2]] as [
              number,
              number,
              number,
            ],
            scale: finalScale,
            rot:
              Math.floor(sr(groupIdx * 1000 + i * 3 + 3) * 4) * (Math.PI / 2),
            collider:
              entry.colliderRadius != null
                ? {
                    x: pos[0],
                    z: pos[2],
                    radius: entry.colliderRadius * userScale,
                  }
                : null,
          };
        });
      }),
    [
      preset.decorations,
      half,
      cellCenters,
      cellCenterOffsets,
      cellCount,
      wallBoxes,
    ]
  );

  useEffect(() => {
    if (!onColliders) return;
    const colliders = decorationGroups
      .flat()
      .flatMap((item) => (item?.collider ? [item.collider] : []));
    onColliders(colliders);
  }, [decorationGroups, onColliders]);

  return (
    <>
      {decorationGroups.map((group) =>
        group?.map(({ key, Component, pos, scale, rot }) => (
          <Component
            key={key}
            position={pos}
            scale={scale}
            rotation={[0, rot, 0]}
          />
        ))
      )}

      {particleList.map((particle, i) => renderParticle(particle, i))}
    </>
  );

  function renderParticle(particle: ParticleConfig, key: number) {
    switch (particle.type) {
      case 'petals':
        return (
          <FallingPetals
            key={key}
            count={particle.count}
            size={size}
            height={height}
            speed={particle.speed}
          />
        );
      case 'leaves':
        return (
          <FallingLeaves
            key={key}
            count={particle.count}
            size={size}
            height={height}
            speed={particle.speed}
          />
        );
      case 'rain':
        return (
          <RainDrops
            key={key}
            count={particle.count}
            size={size}
            height={height}
            speed={particle.speed}
            color={particle.color}
            opacity={particle.opacity}
          />
        );
      case 'snow':
        return (
          <FallingSnow
            key={key}
            count={particle.count}
            size={size}
            height={height}
            speed={particle.speed}
            color={particle.color}
            opacity={particle.opacity}
          />
        );
      case 'sparkles':
        return (
          <Sparkles
            key={key}
            count={particle.count}
            scale={[size - 1, height * 0.8, size - 1]}
            position={[0, height * 0.4, 0]}
            size={5}
            speed={particle.speed}
            opacity={particle.opacity}
            color={particle.color}
            noise={0.3}
          />
        );
      default:
        return null;
    }
  }
}
