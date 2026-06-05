type SkyAtmosphere = {
  type: 'sky';
  sunPosition: [number, number, number];
  turbidity: number;
  rayleigh: number;
  mieCoefficient: number;
  mieDirectionalG: number;
  clouds: boolean;
};

type NightAtmosphere = {
  type: 'night';
  bgColor: string;
  stars: {
    radius: number;
    depth: number;
    count: number;
    factor: number;
    saturation: number;
    speed: number;
  };
};

type GradientAtmosphere = {
  type: 'gradient';
  topColor: string;
  bottomColor: string;
};

export type Atmosphere = SkyAtmosphere | NightAtmosphere | GradientAtmosphere;

export type LightingConfig = {
  hemisphere: [string, string, number];
  ambient: { color: string; intensity: number };
  directional: {
    position: [number, number, number];
    color: string;
    intensity: number;
  };
  toneMappingExposure: number;
};

export type DecorationConfig = {
  model: string;
  count: number;
  /** 설정 시 count 대신 cellCount(gridSize²)에 곱해서 실제 count 계산 */
  countPerCell?: number;
  placement?: 'corner' | 'scattered' | 'cell-center' | 'near-cell-center';
  nearCellRadius?: number;
  scaleMin: number;
  scaleMax: number;
  color?: string;
  elevationMin?: number;
  elevationMax?: number;
  /** 배치 구역 제한 (월드 단위, 방 중심 기준). 미지정 시 방 전체 80% 구역 사용 */
  xRange?: [number, number];
  zRange?: [number, number];
};

export type ParticleConfig = {
  type: 'sparkles' | 'snow' | 'petals' | 'rain' | 'leaves' | 'bubbles';
  color: string;
  count: number;
  speed: number;
  opacity: number;
};

export type FloorConfig = {
  color: string;
  roughness: number;
  metalness: number;
  mirror: number;
  blur: number[];
  /** FLOOR_PATTERNS의 키('wood' | 'grass' 등). 미지정 시 텍스처 없는 단색 바닥 */
  pattern?: string;
};

export type WallPatternConfig = {
  /** WALL_PATTERNS의 키('flower' 등) */
  pattern: string;
  /** 미지정 시 GalleryPreset.wallColor 사용 */
  baseColor?: string;
  /** 미지정 시 레지스트리의 defaultRepeat */
  repeat?: [number, number];
};

export type FlatCeilingConfig = {
  type: 'flat';
  color?: string;
};

export type FairyLightsCeilingConfig = {
  type: 'fairy-lights';
  planeColor?: string;
  bulbColors?: string[];
  /** 천장에 늘어뜨릴 알전구 줄 개수. 미지정 시 2 */
  strandCount?: number;
};

export type CeilingConfig = FlatCeilingConfig | FairyLightsCeilingConfig;

export type GalleryPreset = {
  id: string;
  atmosphere: Atmosphere;
  lighting: LightingConfig;
  floor: FloorConfig;
  wallColor: string;
  wallPattern?: WallPatternConfig;
  ceiling?: CeilingConfig;
  decorations: DecorationConfig[];
  /** 단일 입자 또는 여러 입자 동시 적용(예: forest = 반짝이 + 나뭇잎) */
  particles?: ParticleConfig | ParticleConfig[];
};
