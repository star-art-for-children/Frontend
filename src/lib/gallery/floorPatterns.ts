import { Texture } from 'three';
import { createGrassTexture } from '@/lib/gallery/textures';

type FloorPatternSource =
  | { type: 'image'; url: string }
  | { type: 'procedural'; generator: (color: string) => Texture | null };

export type FloorPatternSpec = {
  source: FloorPatternSource;
  /** 텍스처 반복 횟수 = size / repeatDivisor */
  repeatDivisor: number;
  mixBlur: number;
  mixStrength: number;
  /** 텍스처 원색을 그대로 살릴 때 true (재질 color를 흰색으로 둠) */
  tintWhite?: boolean;
  /** false면 거울 반사 없는 일반 머티리얼로 렌더. 미지정 시 반사 사용 */
  reflective?: boolean;
};

/**
 * 바닥 패턴 레지스트리.
 * 새 패턴을 추가할 때는 여기에 한 줄만 등록하면 되고,
 * DynamicFloor 본체는 수정할 필요가 없다.
 */
export const FLOOR_PATTERNS: Record<string, FloorPatternSpec> = {
  wood: {
    source: { type: 'image', url: '/gallery/floor.jpg' },
    repeatDivisor: 8,
    mixBlur: 0.8,
    mixStrength: 1,
  },
  grass: {
    source: { type: 'procedural', generator: createGrassTexture },
    repeatDivisor: 4,
    mixBlur: 1,
    mixStrength: 1,
    tintWhite: true,
    reflective: false,
  },
};
