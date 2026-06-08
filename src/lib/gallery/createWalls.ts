import { Cell, WAllType } from '@/types/gallery';

function hashSeed(str: string): number {
  let h = 2166136261;
  for (let i = 0; i < str.length; i++) {
    h ^= str.charCodeAt(i);
    h = (h * 16777619) >>> 0;
  }
  return h;
}

function makeRng(seed: string) {
  let s = hashSeed(seed);
  return () => {
    s ^= s << 13;
    s ^= s >> 17;
    s ^= s << 5;
    s = s >>> 0;
    return s / 0x100000000;
  };
}

export function generateGalleryWalls(
  roomSize: number,
  gridSize: number,
  cellSize: number,
  wallColor = '#FFFFFF',
  spawnCornerOffset = 1.5,
  seed = 'default'
) {
  const rng = makeRng(seed);
  const size = gridSize;
  const half = roomSize / 2;

  const startPosition = {
    x: -half + spawnCornerOffset,
    y: 1.6,
    z: -half + spawnCornerOffset,
  };

  // 1. grid 생성
  const grid: Cell[][] = [];
  for (let x = 0; x < size; x++) {
    const row: Cell[] = [];
    for (let z = 0; z < size; z++) {
      row.push({
        x,
        z,
        visited: false,
        walls: { top: true, right: true, bottom: true, left: true },
      });
    }
    grid.push(row);
  }

  const stack: Cell[] = [];
  const start = grid[0][0];
  start.visited = true;
  stack.push(start);

  // 2. DFS
  while (stack.length) {
    const current = stack.pop()!;
    const { x, z } = current;
    const neighbors: Cell[] = [];
    const directions = [
      { dx: 0, dz: -1, dir: 'top' },
      { dx: 1, dz: 0, dir: 'right' },
      { dx: 0, dz: 1, dir: 'bottom' },
      { dx: -1, dz: 0, dir: 'left' },
    ];
    for (const d of directions) {
      const nx = x + d.dx;
      const nz = z + d.dz;
      if (
        nx >= 0 &&
        nz >= 0 &&
        nx < size &&
        nz < size &&
        !grid[nx][nz].visited
      ) {
        neighbors.push(grid[nx][nz]);
      }
    }
    if (neighbors.length) {
      stack.push(current);
      const next = neighbors[Math.floor(rng() * neighbors.length)];
      if (next.x > x) {
        current.walls.right = false;
        next.walls.left = false;
      }
      if (next.x < x) {
        current.walls.left = false;
        next.walls.right = false;
      }
      if (next.z > z) {
        current.walls.bottom = false;
        next.walls.top = false;
      }
      if (next.z < z) {
        current.walls.top = false;
        next.walls.bottom = false;
      }
      next.visited = true;
      stack.push(next);
    }
  }

  // 3. 벽 생성
  const walls: WAllType[] = [];
  for (let x = 0; x < size; x++) {
    for (let z = 0; z < size; z++) {
      const cell = grid[x][z];
      const cx = -half + x * cellSize + cellSize / 2;
      const cz = -half + z * cellSize + cellSize / 2;
      const h = 5;
      const t = 0.3;

      if (cell.walls.top && z === 0) {
        walls.push({
          pos: [cx, h / 2, cz - cellSize / 2],
          boxSize: [cellSize + t, h, t],
          color: wallColor,
          direction: 'top',
          rot: [0, 0, 0],
          isInterior: false,
        });
      }
      if (cell.walls.right) {
        walls.push({
          pos: [cx + cellSize / 2, h / 2, cz],
          boxSize: [cellSize + t, h, t],
          color: wallColor,
          direction: 'right',
          rot: [0, -Math.PI / 2, 0],
          isInterior: x < size - 1,
        });
      }
      if (cell.walls.bottom) {
        walls.push({
          pos: [cx, h / 2, cz + cellSize / 2],
          boxSize: [cellSize + t, h, t],
          color: wallColor,
          direction: 'bottom',
          rot: [0, Math.PI, 0],
          isInterior: z < size - 1,
        });
      }
      if (cell.walls.left && x === 0) {
        walls.push({
          pos: [cx - cellSize / 2, h / 2, cz],
          boxSize: [cellSize + t, h, t],
          color: wallColor,
          direction: 'left',
          rot: [0, Math.PI / 2, 0],
          isInterior: false,
        });
      }
    }
  }

  return { innerWalls: walls, startPosition };
}

export const createWalls = (
  roomSize: number,
  wallHeight: number,
  wallColor = '#FFFFFF'
): WAllType[] => {
  const color = wallColor;
  return [
    {
      color,
      pos: [0, wallHeight / 2, -roomSize / 2],
      boxSize: [roomSize, wallHeight, 0.5],
      rot: [0, 0, 0],
    },
    {
      color,
      pos: [0, wallHeight / 2, roomSize / 2],
      boxSize: [roomSize, wallHeight, 0.5],
      rot: [0, Math.PI, 0],
    },
    {
      color,
      pos: [-roomSize / 2, wallHeight / 2, 0],
      boxSize: [roomSize, wallHeight, 0.5],
      rot: [0, Math.PI / 2, 0],
    },
    {
      color,
      pos: [roomSize / 2, wallHeight / 2, 0],
      boxSize: [roomSize, wallHeight, 0.5],
      rot: [0, -Math.PI / 2, 0],
    },
  ];
};
