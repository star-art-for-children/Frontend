export type GalleryTheme = 'default' | 'cherry' | 'ocean' | 'forest';

export type ThemeConfig = {
  fog: { color: string; near: number; far: number } | null;
  ambientLight: { color: string; intensity: number };
  background: string;
  wallColor: string;
  innerWallColor: string;
  ceilingColor: string;
  lightColor: string;
  floorColor: string;
};

export const THEMES: Record<GalleryTheme, ThemeConfig> = {
  default: {
    fog: null,
    ambientLight: { color: '#ffffff', intensity: 1 },
    background: '#ffffff',
    wallColor: '#E6E0D6',
    innerWallColor: '#E6E0D6',
    ceilingColor: '#CFC8BD',
    lightColor: '#FFF2CC',
    floorColor: '#f7f7f7',
  },
  cherry: {
    fog: { color: '#ffd6e0', near: 8, far: 40 },
    ambientLight: { color: '#fff0f5', intensity: 1.6 },
    background: '#ffe4ee',
    wallColor: '#ffd6e2',
    innerWallColor: '#ffccd8',
    ceilingColor: '#ffb8cc',
    lightColor: '#ffaac2',
    floorColor: '#fff0f5',
  },
  ocean: {
    fog: { color: '#87d9f0', near: 10, far: 45 },
    ambientLight: { color: '#ffffff', intensity: 2.2 },
    background: '#87cefa',
    wallColor: '#7ec8e3',
    innerWallColor: '#90d4ec',
    ceilingColor: '#b0e8f8',
    lightColor: '#ffffff',
    floorColor: '#5aafcc',
  },
  forest: {
    fog: { color: '#1a3a1a', near: 3, far: 22 },
    ambientLight: { color: '#90c040', intensity: 0.9 },
    background: '#1a3a1a',
    wallColor: '#2d5a27',
    innerWallColor: '#336128',
    ceilingColor: '#1e4020',
    lightColor: '#c8e6a0',
    floorColor: '#233b1e',
  },
};

export function getThemeConfig(theme: GalleryTheme): ThemeConfig {
  return THEMES[theme] ?? THEMES.default;
}
