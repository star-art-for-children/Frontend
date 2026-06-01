import { useRef, useMemo } from 'react';
import { useFrame } from '@react-three/fiber';
import { Group, Mesh } from 'three';

// ---- Fish ----
function Fish({
  color,
  accentColor,
  orbitRadius,
  orbitSpeed,
  yHeight,
  size = 1,
  initialAngle = 0,
}: {
  color: string;
  accentColor: string;
  orbitRadius: number;
  orbitSpeed: number;
  yHeight: number;
  size?: number;
  initialAngle?: number;
}) {
  const groupRef = useRef<Group>(null);
  const angle = useRef(initialAngle);

  useFrame((_, delta) => {
    if (!groupRef.current) return;
    angle.current += delta * orbitSpeed;
    const x = Math.cos(angle.current) * orbitRadius;
    const z = Math.sin(angle.current) * orbitRadius;
    groupRef.current.position.set(
      x,
      yHeight + Math.sin(angle.current * 2.5) * 0.15,
      z
    );
    groupRef.current.rotation.y = -(angle.current + Math.PI / 2);
  });

  return (
    <group ref={groupRef} scale={[size, size, size]}>
      {/* Body */}
      <mesh>
        <sphereGeometry args={[0.35, 12, 8]} />
        <meshStandardMaterial color={color} />
      </mesh>
      {/* Snout */}
      <mesh position={[0.32, 0, 0]}>
        <sphereGeometry args={[0.2, 8, 6]} />
        <meshStandardMaterial color={color} />
      </mesh>
      {/* Tail */}
      <mesh position={[-0.48, 0, 0]} rotation={[0, 0, Math.PI / 4]}>
        <boxGeometry args={[0.38, 0.38, 0.08]} />
        <meshStandardMaterial color={accentColor} />
      </mesh>
      {/* Dorsal fin */}
      <mesh position={[0.05, 0.32, 0]} rotation={[0, 0, 0.25]}>
        <boxGeometry args={[0.25, 0.18, 0.05]} />
        <meshStandardMaterial color={accentColor} />
      </mesh>
      {/* Eye white */}
      <mesh position={[0.28, 0.1, 0.2]}>
        <sphereGeometry args={[0.07, 8, 8]} />
        <meshStandardMaterial color="white" />
      </mesh>
      {/* Eye pupil */}
      <mesh position={[0.31, 0.1, 0.22]}>
        <sphereGeometry args={[0.04, 8, 8]} />
        <meshStandardMaterial color="#111" />
      </mesh>
    </group>
  );
}

// ---- Seaweed ----
function SeaweedCluster({
  x,
  z,
  height,
  color,
  offsetSeed = 0,
}: {
  x: number;
  z: number;
  height: number;
  color: string;
  offsetSeed?: number;
}) {
  const ref = useRef<Group>(null);
  const offset = useRef(offsetSeed);
  const segments = Math.ceil(height / 0.42);

  useFrame(({ clock }) => {
    if (!ref.current) return;
    const t = clock.getElapsedTime();
    ref.current.rotation.z = Math.sin(t * 0.7 + offset.current) * 0.22;
    ref.current.rotation.x = Math.sin(t * 0.5 + offset.current + 1) * 0.08;
  });

  return (
    <group ref={ref} position={[x, 0, z]}>
      {Array.from({ length: segments }).map((_, i) => (
        <mesh key={i} position={[0, i * 0.42 + 0.21, 0]}>
          <cylinderGeometry args={[0.03, 0.055, 0.45, 6]} />
          <meshStandardMaterial color={color} />
        </mesh>
      ))}
    </group>
  );
}

// ---- Coral ----
function Coral({ x, z, color }: { x: number; z: number; color: string }) {
  return (
    <group position={[x, 0, z]}>
      <mesh position={[0, 0.28, 0]}>
        <cylinderGeometry args={[0.045, 0.075, 0.56, 8]} />
        <meshStandardMaterial color={color} />
      </mesh>
      <mesh position={[0, 0.58, 0]}>
        <sphereGeometry args={[0.13, 8, 8]} />
        <meshStandardMaterial color={color} />
      </mesh>
      <mesh position={[-0.16, 0.42, 0]} rotation={[0, 0, 0.55]}>
        <cylinderGeometry args={[0.03, 0.048, 0.38, 6]} />
        <meshStandardMaterial color={color} />
      </mesh>
      <mesh position={[-0.3, 0.57, 0]}>
        <sphereGeometry args={[0.09, 8, 8]} />
        <meshStandardMaterial color={color} />
      </mesh>
      <mesh position={[0.16, 0.42, 0]} rotation={[0, 0, -0.55]}>
        <cylinderGeometry args={[0.03, 0.048, 0.38, 6]} />
        <meshStandardMaterial color={color} />
      </mesh>
      <mesh position={[0.3, 0.57, 0]}>
        <sphereGeometry args={[0.09, 8, 8]} />
        <meshStandardMaterial color={color} />
      </mesh>
    </group>
  );
}

// ---- Bubble ----
function Bubble({
  x,
  z,
  speed,
  startY,
  radius,
  driftSeed = 0,
}: {
  x: number;
  z: number;
  speed: number;
  startY: number;
  radius: number;
  driftSeed?: number;
}) {
  const ref = useRef<Mesh>(null);
  const y = useRef(startY);
  const drift = useRef(driftSeed);

  useFrame((_, delta) => {
    if (!ref.current) return;
    y.current += delta * speed;
    if (y.current > 5.8) y.current = 0.1;
    ref.current.position.set(
      x + Math.sin(y.current * 1.5 + drift.current) * 0.12,
      y.current,
      z + Math.cos(y.current * 1.2 + drift.current) * 0.08
    );
  });

  return (
    <mesh ref={ref} position={[x, startY, z]}>
      <sphereGeometry args={[radius, 8, 8]} />
      <meshStandardMaterial
        color="#c8f0ff"
        transparent
        opacity={0.45}
        roughness={0}
        metalness={0.1}
      />
    </mesh>
  );
}

// ---- Main OceanDecor ----
export default function OceanDecor({ size }: { size: number }) {
  const half = size / 2 - 0.8;

  const fishData = useMemo(
    () => [
      {
        color: '#ff6b35',
        accent: '#ffd700',
        r: half * 0.35,
        speed: 0.5,
        y: 2.5,
        sz: 0.8,
        a: 0,
      },
      {
        color: '#e91e8c',
        accent: '#ff69b4',
        r: half * 0.5,
        speed: -0.38,
        y: 3.5,
        sz: 0.65,
        a: 1.0,
      },
      {
        color: '#ffd700',
        accent: '#ff8c00',
        r: half * 0.3,
        speed: 0.42,
        y: 1.8,
        sz: 0.9,
        a: 2.1,
      },
      {
        color: '#00c8ff',
        accent: '#ffffff',
        r: half * 0.6,
        speed: -0.28,
        y: 2.8,
        sz: 1.1,
        a: 3.5,
      },
      {
        color: '#ff4466',
        accent: '#ffaaaa',
        r: half * 0.45,
        speed: 0.55,
        y: 4.0,
        sz: 0.7,
        a: 0.5,
      },
      {
        color: '#9b59b6',
        accent: '#cc88ff',
        r: half * 0.55,
        speed: -0.45,
        y: 2.0,
        sz: 0.8,
        a: 2.5,
      },
      {
        color: '#ff8c00',
        accent: '#ffe066',
        r: half * 0.4,
        speed: 0.3,
        y: 3.2,
        sz: 1.2,
        a: 4.0,
      },
      {
        color: '#00e676',
        accent: '#69ffaa',
        r: half * 0.65,
        speed: -0.32,
        y: 1.5,
        sz: 0.6,
        a: 1.5,
      },
      {
        color: '#ff1493',
        accent: '#ff69b4',
        r: half * 0.28,
        speed: 0.6,
        y: 4.2,
        sz: 0.55,
        a: 5.0,
      },
      {
        color: '#00bcd4',
        accent: '#b2ebf2',
        r: half * 0.72,
        speed: -0.22,
        y: 3.0,
        sz: 1.3,
        a: 0.8,
      },
    ],
    [half]
  );

  const seaweedData = useMemo(() => {
    const greens = ['#2ecc71', '#27ae60', '#1abc9c', '#16a085', '#22c55e'];
    const wall = size / 2 - 0.3;
    const count = Math.max(3, Math.floor(size / 3.5));
    const result: {
      x: number;
      z: number;
      height: number;
      color: string;
      offsetSeed: number;
    }[] = [];
    for (let i = 0; i < count; i++) {
      const t = -size / 2 + 1 + (i / Math.max(count - 1, 1)) * (size - 2);
      const h = (j: number) => 0.8 + Math.abs(Math.sin(i * 3.7 + j)) * 1.2;
      const c = (j: number) =>
        greens[Math.floor(Math.abs(Math.sin(i * 5.1 + j)) * 5)];
      const s = (j: number) => (i * 2.39 + j * 1.61) % (Math.PI * 2);
      result.push(
        { x: -wall, z: t, height: h(0), color: c(0), offsetSeed: s(0) },
        { x: wall, z: t, height: h(1), color: c(1), offsetSeed: s(1) },
        { x: t, z: -wall, height: h(2), color: c(2), offsetSeed: s(2) },
        { x: t, z: wall, height: h(3), color: c(3), offsetSeed: s(3) }
      );
    }
    return result;
  }, [size]);

  const coralData = useMemo(() => {
    const colors = [
      '#ff6b9d',
      '#ff4466',
      '#ff8c42',
      '#e91e63',
      '#ff5722',
      '#ff1493',
    ];
    const edge = size / 2 - 1.2;
    const count = Math.max(5, Math.floor(size / 2.5));
    return Array.from({ length: count }, (_, i) => {
      const angle = (i / count) * Math.PI * 2;
      return {
        x: Math.cos(angle) * edge,
        z: Math.sin(angle) * edge,
        color: colors[i % colors.length],
      };
    });
  }, [size]);

  const bubbleData = useMemo(
    () =>
      Array.from({ length: 20 }, (_, i) => ({
        x: (((i * 1.618) % 1) - 0.5) * (size - 2),
        z: (((i * 2.718) % 1) - 0.5) * (size - 2),
        speed: 0.25 + (i % 5) * 0.12,
        startY: (i / 20) * 5,
        radius: 0.04 + (i % 4) * 0.015,
        driftSeed: (i * 2.39) % (Math.PI * 2),
      })),
    [size]
  );

  return (
    <>
      {fishData.map((f, i) => (
        <Fish
          key={i}
          color={f.color}
          accentColor={f.accent}
          orbitRadius={f.r}
          orbitSpeed={f.speed}
          yHeight={f.y}
          size={f.sz}
          initialAngle={f.a}
        />
      ))}
      {seaweedData.map((sw, i) => (
        <SeaweedCluster
          key={`sw-${i}`}
          x={sw.x}
          z={sw.z}
          height={sw.height}
          color={sw.color}
          offsetSeed={sw.offsetSeed}
        />
      ))}
      {coralData.map((c, i) => (
        <Coral key={`cr-${i}`} x={c.x} z={c.z} color={c.color} />
      ))}
      {bubbleData.map((b, i) => (
        <Bubble
          key={`bub-${i}`}
          x={b.x}
          z={b.z}
          speed={b.speed}
          startY={b.startY}
          radius={b.radius}
          driftSeed={b.driftSeed}
        />
      ))}
    </>
  );
}
