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
  type: 'sparkles' | 'snow' | 'petals' | 'rain' | 'leaves';
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
  useTexture: boolean;
};

export type GalleryPreset = {
  id: string;
  atmosphere: Atmosphere;
  lighting: LightingConfig;
  floor: FloorConfig;
  wallColor: string;
  decorations: DecorationConfig[];
  particles?: ParticleConfig;
};
