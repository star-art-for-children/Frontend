import { CanvasTexture, RepeatWrapping, Texture } from 'three';

export function createFlowerPatternTexture(
  baseColor = '#D8ECC0'
): Texture | null {
  if (typeof document === 'undefined') return null;

  const canvas = document.createElement('canvas');
  canvas.width = 256;
  canvas.height = 256;
  const ctx = canvas.getContext('2d');
  if (!ctx) return null;

  ctx.fillStyle = baseColor;
  ctx.fillRect(0, 0, 256, 256);

  const flowers = [
    { x: 40, y: 50, color: '#F8C8D8' },
    { x: 170, y: 90, color: '#FFE0A0' },
    { x: 90, y: 180, color: '#E0C8F0' },
    { x: 210, y: 210, color: '#F8D8E8' },
    { x: 130, y: 130, color: '#FFFFFF' },
    { x: 60, y: 220, color: '#FFD5B0' },
    { x: 230, y: 50, color: '#F8C8D8' },
  ];

  for (const f of flowers) {
    ctx.fillStyle = f.color;
    for (let p = 0; p < 5; p++) {
      const a = (p / 5) * Math.PI * 2;
      ctx.beginPath();
      ctx.arc(
        f.x + Math.cos(a) * 8,
        f.y + Math.sin(a) * 8,
        6,
        0,
        Math.PI * 2
      );
      ctx.fill();
    }
    ctx.fillStyle = '#FFE060';
    ctx.beginPath();
    ctx.arc(f.x, f.y, 4, 0, Math.PI * 2);
    ctx.fill();
  }

  const tex = new CanvasTexture(canvas);
  tex.wrapS = tex.wrapT = RepeatWrapping;
  return tex;
}

export function createGrassTexture(baseColor = '#9DC872'): Texture | null {
  if (typeof document === 'undefined') return null;

  const canvas = document.createElement('canvas');
  canvas.width = 256;
  canvas.height = 256;
  const ctx = canvas.getContext('2d');
  if (!ctx) return null;

  ctx.fillStyle = baseColor;
  ctx.fillRect(0, 0, 256, 256);

  for (let i = 0; i < 400; i++) {
    const x = Math.random() * 256;
    const y = Math.random() * 256;
    const len = 3 + Math.random() * 5;
    const greens = ['#7AAE58', '#88B860', '#A5D080', '#6B9E48'];
    ctx.strokeStyle = greens[Math.floor(Math.random() * greens.length)];
    ctx.lineWidth = 1.2;
    ctx.beginPath();
    ctx.moveTo(x, y);
    ctx.lineTo(x + (Math.random() - 0.5) * 2, y - len);
    ctx.stroke();
  }

  const tex = new CanvasTexture(canvas);
  tex.wrapS = tex.wrapT = RepeatWrapping;
  return tex;
}
