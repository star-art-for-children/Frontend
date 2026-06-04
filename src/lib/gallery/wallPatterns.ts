import { Texture } from 'three';
import { createFlowerPatternTexture } from '@/lib/gallery/textures';

export type WallPatternSpec = {
  /** baseColor를 받아 절차적으로 텍스처를 생성 */
  generator: (baseColor: string) => Texture | null;
  /** wallPattern.repeat 미지정 시 사용할 기본 반복 [x, y] */
  defaultRepeat: [number, number];
};

/**
 * 벽 패턴 레지스트리.
 * 새 패턴을 추가할 때는 여기에 한 줄만 등록하면 되고,
 * Walls / InnerWalls 본체는 수정할 필요가 없다.
 */
export const WALL_PATTERNS: Record<string, WallPatternSpec> = {
  flower: {
    generator: createFlowerPatternTexture,
    defaultRepeat: [3, 1.5],
  },
};
