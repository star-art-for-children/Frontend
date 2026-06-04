import React, { useEffect, useMemo } from 'react';
import { Sparkles } from '@react-three/drei';
import { GalleryPreset } from '@/types/gallery-theme';
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
  nearCellRadius = 2
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

  return Array.from(
    { length: count },
    (_, i) =>
      [
        rr(seedOffset + i * 3, xMin, xMax),
        rr(seedOffset + i * 3 + 10, elevationMin, elevationMax),
        rr(seedOffset + i * 3 + 1, zMin, zMax),
      ] as [number, number, number]
  );
}

export type CircleCollider = { x: number; z: number; radius: number };

export default function DynamicDecorations({
  preset,
  size,
  height,
  cellSize = 12,
  gridSize = 1,
  onColliders,
}: {
  preset: GalleryPreset;
  size: number;
  height: number;
  cellSize?: number;
  gridSize?: number;
  onColliders?: (colliders: CircleCollider[]) => void;
}) {
  const half = size / 2;
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
          cfg.nearCellRadius ?? 2
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
    [preset.decorations, half, cellCenters, cellCenterOffsets, cellCount]
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

      {preset.particles?.type === 'petals' && (
        <FallingPetals
          count={preset.particles.count}
          size={size}
          height={height}
          speed={preset.particles.speed}
        />
      )}

      {preset.particles?.type === 'rain' && (
        <RainDrops
          count={preset.particles.count}
          size={size}
          height={height}
          speed={preset.particles.speed}
          color={preset.particles.color}
          opacity={preset.particles.opacity}
        />
      )}

      {preset.particles?.type === 'snow' && (
        <FallingSnow
          count={preset.particles.count}
          size={size}
          height={height}
          speed={preset.particles.speed}
          color={preset.particles.color}
          opacity={preset.particles.opacity}
        />
      )}

      {preset.particles?.type === 'leaves' && (
        <FallingLeaves
          count={preset.particles.count}
          size={size}
          height={height}
          speed={preset.particles.speed}
          color={preset.particles.color}
          opacity={preset.particles.opacity}
        />
      )}

      {preset.particles?.type === 'sparkles' && (
        <Sparkles
          count={preset.particles.count}
          scale={[size - 1, height * 0.8, size - 1]}
          position={[0, height * 0.4, 0]}
          size={5}
          speed={preset.particles.speed}
          opacity={preset.particles.opacity}
          color={preset.particles.color}
          noise={0.3}
        />
      )}
    </>
  );
}
