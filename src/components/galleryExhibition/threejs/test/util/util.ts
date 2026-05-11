import { Cell, FormValidation, WAllType } from '@/types/gallery';
import { Texture } from 'three';
import React from 'react';
import { SupabaseClient } from '@supabase/supabase-js';

export function generateGalleryWalls(roomSize: number) {
  const size = 3;
  const cellSize = roomSize / size;
  const half = roomSize / 2;

  // 1. grid 생성
  const grid: Cell[][] = [];

  for (let x = 0; x < size; x++) {
    const row: Cell[] = [];
    for (let z = 0; z < size; z++) {
      row.push({
        x,
        z,
        visited: false,
        walls: {
          top: true,
          right: true,
          bottom: true,
          left: true,
        },
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

      const next = neighbors[Math.floor(Math.random() * neighbors.length)];

      // 벽 제거
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

      const h = roomSize * 0.2;
      const t = 0.3;

      //똑같은 두께의 벽이 동일좌표에 생성되니까 텍스쳐가 깨질 가능성? -> 벽을 z축으로 조금 더 미는거?
      // top
      if (cell.walls.top) {
        walls.push({
          pos: [cx, h / 2, cz - cellSize / 2],
          boxSize: [cellSize, h, t],
          color: '#ffffff',
          direction: 'top',
          rot: [0, 0, 0],
        });
      }

      // right
      if (cell.walls.right) {
        walls.push({
          pos: [cx + cellSize / 2, h / 2, cz],
          boxSize: [cellSize, h, t],
          color: '#ffffff',
          direction: 'right',
          rot: [0, -Math.PI / 2, 0],
        });
      }

      // bottom
      if (cell.walls.bottom) {
        walls.push({
          pos: [cx, h / 2, cz + cellSize / 2],
          boxSize: [cellSize, h, t],
          color: '#ffffff',
          direction: 'bottom',
          rot: [0, Math.PI, 0],
        });
      }

      // left
      if (cell.walls.left) {
        walls.push({
          pos: [cx - cellSize / 2, h / 2, cz],
          boxSize: [cellSize, h, t],
          color: '#ffffff',
          direction: 'left',
          rot: [0, Math.PI / 2, 0],
        });
      }
    }
  }

  return walls;
}

export const createWalls = (
  roomSize: number,
  wallHeight: number
): WAllType[] => {
  return [
    {
      color: '#E6E0D6',
      pos: [0, wallHeight / 2, -roomSize / 2],
      boxSize: [roomSize, wallHeight, 0.5],
      rot: [0, 0, 0],
    },
    {
      color: '#ECE6DC',
      pos: [0, wallHeight / 2, roomSize / 2],
      boxSize: [roomSize, wallHeight, 0.5],
      rot: [0, Math.PI, 0],
    },
    {
      color: '#E6E0D6',
      pos: [-roomSize / 2, wallHeight / 2, 0],
      boxSize: [roomSize, wallHeight, 0.5],
      rot: [0, Math.PI / 2, 0],
    },
    {
      color: '#F2ECE2',
      pos: [roomSize / 2, wallHeight / 2, 0],
      boxSize: [roomSize, wallHeight, 0.5],
      rot: [0, -Math.PI / 2, 0],
    },
  ];
};

export function checkImgSize(
  img: Texture,
  w: number,
  h: number,
  offset: number
) {
  const imgAspect = img?.width / img?.height;

  const wallAspect = w / h;

  let imgW, imgH;

  if (imgAspect > wallAspect) {
    imgW = w * offset;
    imgH = imgW / imgAspect;
  } else {
    imgH = h * offset;
    imgW = imgH * imgAspect;
  }
  return [imgW, imgH];
}

export async function downloadImgHandler(
  e: React.MouseEvent<HTMLButtonElement>,
  url: string,
  title: string
) {
  e.stopPropagation();
  try {
    const res = await fetch(url);
    const blob = await res.blob();

    const blobUrl = window.URL.createObjectURL(blob);

    const a = document.createElement('a');
    a.href = blobUrl;
    a.download = title || 'image';

    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);

    window.URL.revokeObjectURL(blobUrl);
  } catch (err) {
    console.error('download fail', err);
  }
}
export function likesHandler(paintingId: number) {
  // 얘는 로그인 필요 -> 페인팅 아이디만넘겨주면 서버측에서 paintingId + userId 로 db저장
}

export function bookmarkHandler(paintingId: number) {
  // 좋아요가 있는데 필요할까?
}

////api

export function parseFormDataToObj(formData: FormData) {
  const body = formData;
  const galleryImg = body.get('galleryImg');
  const galleryName = body.get('galleryName');
  const galleryDesc = body.get('galleryDesc');
  const guideLines = body.get('guideLines');
  const startDate = body.get('startDate');
  const endDate = body.get('endDate');

  return {
    title: galleryName,
    description: galleryDesc,
    thumbnailImg: galleryImg,
    startDateRaw: startDate,
    endDateRaw: endDate,
    guidelines: guideLines,
  };
}

export function validateExhibition(init: FormValidation) {
  const {
    title,
    description,
    thumbnailImg,
    startDateRaw,
    endDateRaw,
    guidelines,
  } = init;

  if (typeof title !== 'string' || !title.trim()) {
    return { error: 'invalid title' };
  }

  if (typeof description !== 'string') {
    return { error: 'invalid description' };
  }
  if (guidelines !== null && typeof guidelines !== 'string') {
    return { error: 'invalid guidelines' };
  }

  if (thumbnailImg != null && !(thumbnailImg instanceof File)) {
    return { error: 'invalid image' };
  }

  if (typeof startDateRaw !== 'string') {
    return { error: 'invalid startDate' };
  }

  const start_date = new Date(startDateRaw);

  if (isNaN(start_date.getTime())) {
    return { error: 'invalid startDate' };
  }

  let end_date: Date | null = null;
  if (typeof endDateRaw === 'string') {
    end_date = new Date(endDateRaw);

    if (isNaN(end_date.getTime())) {
      return { error: 'invalid endDate' };
    }
  }

  return {
    data: {
      title,
      description,
      thumbnailImg,
      start_date,
      end_date,
      guidelines,
    },
  };
}
/////// 권한 체크

type RoleCheckResult =
  | { ok: false; status: number; message: string }
  | { ok: true; user: { id: string } };
export async function checkRole(
  supabase: SupabaseClient
): Promise<RoleCheckResult> {
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return { ok: false, status: 401, message: 'no session' };

  const { data: profile, error: profileError } = await supabase
    .from('profiles')
    .select('role')
    .eq('id', user.id)
    .single();

  if (!profile || profileError)
    return { ok: false, status: 403, message: 'no profile' };

  if (profile.role !== 'teacher')
    return { ok: false, status: 403, message: 'no role' };

  return { ok: true, user };
}

export async function uploadImgToSupabase(
  supabase: SupabaseClient,
  file: File,
  bucket: string
) {
  const randomId = crypto.randomUUID();
  const ext = file.name.split('.').pop();
  const filePath = `${randomId}.${ext}`;

  const { error } = await supabase.storage.from(bucket).upload(filePath, file);

  if (error) {
    throw new Error('Image upload failed');
  }

  const { data } = supabase.storage.from(bucket).getPublicUrl(filePath);

  return data.publicUrl;
}
