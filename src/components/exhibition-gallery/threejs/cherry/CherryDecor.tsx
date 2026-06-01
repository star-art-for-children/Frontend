import { useRef, useMemo } from 'react';
import { useFrame } from '@react-three/fiber';
import { DoubleSide, Group, Mesh, Shape } from 'three';

// Real cherry blossom petal — teardrop with notch at top
const PETAL_SHAPE = (() => {
  const s = new Shape();
  s.moveTo(0, -0.06);
  s.bezierCurveTo(0.05, -0.06, 0.075, 0, 0.075, 0.04);
  s.bezierCurveTo(0.075, 0.09, 0.035, 0.12, 0.016, 0.13);
  s.bezierCurveTo(0.006, 0.145, 0, 0.15, 0, 0.142);
  s.bezierCurveTo(0, 0.15, -0.006, 0.145, -0.016, 0.13);
  s.bezierCurveTo(-0.035, 0.12, -0.075, 0.09, -0.075, 0.04);
  s.bezierCurveTo(-0.075, 0, -0.05, -0.06, 0, -0.06);
  return s;
})();

// ---- Falling Petal ----
function Petal({
  x,
  z,
  speed,
  startY,
  rotSpeedX,
  rotSpeedZ,
  color,
  initRotY,
  driftSeed = 0,
}: {
  x: number;
  z: number;
  speed: number;
  startY: number;
  rotSpeedX: number;
  rotSpeedZ: number;
  color: string;
  initRotY: number;
  driftSeed?: number;
}) {
  const ref = useRef<Mesh>(null);
  const y = useRef(startY);
  const drift = useRef(driftSeed);

  useFrame((_, delta) => {
    if (!ref.current) return;
    y.current -= delta * speed;
    if (y.current < -0.2) y.current = 5.6;
    ref.current.position.set(
      x + Math.sin(y.current * 0.85 + drift.current) * 0.45,
      y.current,
      z + Math.cos(y.current * 0.65 + drift.current) * 0.3
    );
    ref.current.rotation.x += delta * rotSpeedX;
    ref.current.rotation.z += delta * rotSpeedZ;
    ref.current.rotation.y += delta * 0.28;
  });

  return (
    <mesh
      ref={ref}
      position={[x, startY, z]}
      rotation={[0.4, initRotY, 0]}
      scale={1.5}
    >
      <shapeGeometry args={[PETAL_SHAPE, 8]} />
      <meshStandardMaterial
        color={color}
        side={DoubleSide}
        transparent
        opacity={0.92}
      />
    </mesh>
  );
}

// ---- Park Bench ----
function Bench({ x, z, rotY }: { x: number; z: number; rotY: number }) {
  return (
    <group position={[x, 0, z]} rotation={[0, rotY, 0]}>
      {/* Seat planks */}
      {[-0.08, 0.08].map((ox, i) => (
        <mesh key={i} position={[0, 0.46, ox]}>
          <boxGeometry args={[1.4, 0.07, 0.14]} />
          <meshStandardMaterial color="#8B5E3C" roughness={0.8} />
        </mesh>
      ))}
      {/* Back rest planks */}
      {[-0.06, 0.1].map((oy, i) => (
        <mesh key={i} position={[0, 0.7 + oy, -0.18]} rotation={[-0.18, 0, 0]}>
          <boxGeometry args={[1.4, 0.07, 0.12]} />
          <meshStandardMaterial color="#8B5E3C" roughness={0.8} />
        </mesh>
      ))}
      {/* Legs */}
      {([-0.56, 0.56] as number[]).flatMap((lx) =>
        ([-0.16, 0.16] as number[]).map((lz, i) => (
          <mesh key={`${lx}-${i}`} position={[lx, 0.22, lz]}>
            <boxGeometry args={[0.07, 0.44, 0.07]} />
            <meshStandardMaterial color="#6b3a2a" roughness={0.9} />
          </mesh>
        ))
      )}
      {/* Support rail */}
      <mesh position={[0, 0.28, 0]}>
        <boxGeometry args={[1.28, 0.05, 0.04]} />
        <meshStandardMaterial color="#6b3a2a" />
      </mesh>
    </group>
  );
}

// ---- Park Lamp Post ----
function LampPost({ x, z }: { x: number; z: number }) {
  return (
    <group position={[x, 0, z]}>
      {/* Base */}
      <mesh position={[0, 0.08, 0]}>
        <cylinderGeometry args={[0.12, 0.15, 0.16, 6]} />
        <meshStandardMaterial color="#5a5a6a" metalness={0.7} roughness={0.3} />
      </mesh>
      {/* Post */}
      <mesh position={[0, 1.85, 0]}>
        <cylinderGeometry args={[0.035, 0.055, 3.5, 7]} />
        <meshStandardMaterial color="#5a5a6a" metalness={0.6} roughness={0.4} />
      </mesh>
      {/* Arm */}
      <mesh position={[0.2, 3.55, 0]} rotation={[0, 0, -0.25]}>
        <cylinderGeometry args={[0.022, 0.028, 0.48, 6]} />
        <meshStandardMaterial color="#5a5a6a" metalness={0.6} roughness={0.4} />
      </mesh>
      {/* Lamp cap */}
      <mesh position={[0.4, 3.42, 0]}>
        <cylinderGeometry args={[0.2, 0.14, 0.28, 8]} />
        <meshStandardMaterial color="#5a5a6a" metalness={0.5} roughness={0.3} />
      </mesh>
      {/* Globe */}
      <mesh position={[0.4, 3.32, 0]}>
        <sphereGeometry args={[0.16, 8, 8]} />
        <meshStandardMaterial
          color="#ffe8a0"
          emissive="#ffdd60"
          emissiveIntensity={0.9}
          transparent
          opacity={0.88}
        />
      </mesh>
      <pointLight
        position={[0.4, 3.32, 0]}
        color="#ffe8a0"
        intensity={2}
        distance={7}
      />
    </group>
  );
}

// ---- Butterfly ----
function Butterfly({
  orbitRadiusX,
  orbitRadiusZ,
  speed,
  yBase,
  color,
  initAngle,
  flapSeed = 0,
}: {
  orbitRadiusX: number;
  orbitRadiusZ: number;
  speed: number;
  yBase: number;
  color: string;
  initAngle: number;
  flapSeed?: number;
}) {
  const groupRef = useRef<Group>(null);
  const leftRef = useRef<Mesh>(null);
  const rightRef = useRef<Mesh>(null);
  const angle = useRef(initAngle);
  const flapT = useRef(flapSeed);

  useFrame((_, delta) => {
    if (!groupRef.current) return;
    angle.current += delta * speed;
    flapT.current += delta * 5.5;

    groupRef.current.position.set(
      Math.cos(angle.current) * orbitRadiusX,
      yBase + Math.sin(angle.current * 2.8) * 0.22,
      Math.sin(angle.current) * orbitRadiusZ
    );
    groupRef.current.rotation.y = -(angle.current + Math.PI / 2);

    const flap = Math.abs(Math.sin(flapT.current)) * 0.85;
    if (leftRef.current) leftRef.current.rotation.y = flap;
    if (rightRef.current) rightRef.current.rotation.y = -flap;
  });

  return (
    <group ref={groupRef}>
      <mesh ref={leftRef} position={[-0.1, 0, 0]}>
        <planeGeometry args={[0.26, 0.2]} />
        <meshStandardMaterial
          color={color}
          side={DoubleSide}
          transparent
          opacity={0.85}
        />
      </mesh>
      <mesh ref={rightRef} position={[0.1, 0, 0]}>
        <planeGeometry args={[0.26, 0.2]} />
        <meshStandardMaterial
          color={color}
          side={DoubleSide}
          transparent
          opacity={0.85}
        />
      </mesh>
      {/* Body */}
      <mesh rotation={[0, 0, Math.PI / 2]}>
        <cylinderGeometry args={[0.018, 0.018, 0.22, 5]} />
        <meshStandardMaterial color="#2a1a0a" />
      </mesh>
    </group>
  );
}

// ---- Flower Bed ----
function FlowerBed({ x, z }: { x: number; z: number }) {
  const flowers = useMemo(() => {
    const colors = [
      '#ff91a8',
      '#ffe066',
      '#ffffff',
      '#ffb7c5',
      '#ffcc00',
      '#ff7eb3',
      '#fff0a0',
    ];
    return Array.from({ length: 9 }, (_, i) => ({
      ox: Math.sin(i * 0.698) * 0.38,
      oz: Math.cos(i * 0.698) * 0.38,
      height: 0.22 + (i % 3) * 0.09,
      color: colors[i % colors.length],
    }));
  }, []);

  return (
    <group position={[x, 0, z]}>
      {flowers.map((f, i) => (
        <group key={i} position={[f.ox, 0, f.oz]}>
          <mesh position={[0, f.height / 2, 0]}>
            <cylinderGeometry args={[0.014, 0.02, f.height, 4]} />
            <meshStandardMaterial color="#4a8c3f" />
          </mesh>
          <mesh position={[0, f.height + 0.055, 0]}>
            <sphereGeometry args={[0.055, 6, 6]} />
            <meshStandardMaterial color={f.color} />
          </mesh>
        </group>
      ))}
    </group>
  );
}

// ---- Blossom cluster for tree tips ----
function BlossomCluster({
  x,
  y,
  z,
  scale = 1,
}: {
  x: number;
  y: number;
  z: number;
  scale?: number;
}) {
  const colors = ['#ff91a8', '#ffb7c5', '#ffc8d4', '#ff7895', '#ffd5e0'];
  return (
    <group position={[x, y, z]}>
      {[0, 1, 2, 3, 4, 5, 6].map((i) => (
        <mesh
          key={i}
          position={[
            Math.sin(i * 0.9) * 0.28 * scale,
            Math.abs(Math.sin(i * 1.3)) * 0.22 * scale,
            Math.cos(i * 0.9) * 0.28 * scale,
          ]}
        >
          <sphereGeometry args={[(0.18 + (i % 3) * 0.06) * scale, 7, 7]} />
          <meshStandardMaterial
            color={colors[i % colors.length]}
            transparent
            opacity={0.9}
          />
        </mesh>
      ))}
    </group>
  );
}

// ---- Cherry Tree ----
function CherryTree({
  x,
  z,
  scale = 1,
}: {
  x: number;
  z: number;
  scale?: number;
}) {
  const blossomClouds = useMemo(
    () =>
      Array.from({ length: 14 }, (_, i) => ({
        px: Math.sin(i * 2.39) * 0.9,
        py: 0.15 + Math.abs(Math.sin(i * 1.1)) * 0.7,
        pz: Math.cos(i * 2.39) * 0.9,
        r: 0.2 + (i % 3) * 0.07,
        color: ['#ff91a8', '#ffb7c5', '#ffc8d4', '#ff7895', '#ffd5e0'][i % 5],
      })),
    []
  );

  return (
    <group position={[x, 0, z]} scale={[scale, scale, scale]}>
      <mesh position={[0, 1.3, 0]}>
        <cylinderGeometry args={[0.1, 0.17, 2.6, 8]} />
        <meshStandardMaterial color="#5c3317" roughness={0.9} />
      </mesh>
      {/* 4 main branches */}
      {(
        [
          [0, -0.62, 0.52, 0.75, 0],
          [0, 0.62, -0.52, 0.75, 0],
          [0.62, 0, 0, 0.75, 0.52],
          [-0.62, 0, 0, 0.75, -0.52],
        ] as [number, number, number, number, number][]
      ).map(([rx, rz, px, py, pz], i) => (
        <mesh key={i} rotation={[rx, 0, rz]} position={[px, py + 2, pz]}>
          <cylinderGeometry args={[0.033, 0.068, 1.15, 6]} />
          <meshStandardMaterial color="#5c3317" roughness={0.9} />
        </mesh>
      ))}
      <group position={[0, 2.9, 0]}>
        {blossomClouds.map((b, i) => (
          <mesh key={i} position={[b.px, b.py, b.pz]}>
            <sphereGeometry args={[b.r, 7, 7]} />
            <meshStandardMaterial color={b.color} transparent opacity={0.88} />
          </mesh>
        ))}
      </group>
      <BlossomCluster x={1.0} y={3.1} z={0} scale={0.8} />
      <BlossomCluster x={-1.0} y={3.1} z={0} scale={0.8} />
      <BlossomCluster x={0} y={3.1} z={1.0} scale={0.8} />
      <BlossomCluster x={0} y={3.1} z={-1.0} scale={0.8} />
    </group>
  );
}

// ---- Main CherryDecor ----
export default function CherryDecor({ size }: { size: number }) {
  const half = size / 2;
  const treeOffset = half * 0.62;

  const petalData = useMemo(() => {
    const colors = [
      '#ff91a8',
      '#ffb7c5',
      '#ffc0cb',
      '#ff7895',
      '#ffd5de',
      '#ffadc0',
      '#ffe4ec',
    ];
    return Array.from({ length: 45 }, (_, i) => ({
      x: (((i * 1.618) % 1) - 0.5) * (size - 1.5),
      z: (((i * 2.718) % 1) - 0.5) * (size - 1.5),
      speed: 0.15 + (i % 6) * 0.045,
      startY: (i / 45) * 5.6,
      rotSpeedX: 0.45 + (i % 4) * 0.35,
      rotSpeedZ: 0.25 + (i % 5) * 0.28,
      color: colors[i % colors.length],
      initRotY: (i * 0.618) % (Math.PI * 2),
      driftSeed: (i * 2.39) % (Math.PI * 2),
    }));
  }, [size]);

  const butterflyData = useMemo(
    () => [
      {
        orbitRadiusX: half * 0.28,
        orbitRadiusZ: half * 0.22,
        speed: 0.55,
        yBase: 2.2,
        color: '#f9d71c',
        initAngle: 0,
        flapSeed: 0,
      },
      {
        orbitRadiusX: half * 0.38,
        orbitRadiusZ: half * 0.32,
        speed: -0.42,
        yBase: 3.0,
        color: '#ff91a8',
        initAngle: 2.1,
        flapSeed: 1.26,
      },
      {
        orbitRadiusX: half * 0.22,
        orbitRadiusZ: half * 0.35,
        speed: 0.48,
        yBase: 2.5,
        color: '#c8f0ff',
        initAngle: 1.3,
        flapSeed: 2.51,
      },
      {
        orbitRadiusX: half * 0.45,
        orbitRadiusZ: half * 0.2,
        speed: -0.35,
        yBase: 3.4,
        color: '#ffffff',
        initAngle: 3.8,
        flapSeed: 3.77,
      },
      {
        orbitRadiusX: half * 0.32,
        orbitRadiusZ: half * 0.42,
        speed: 0.62,
        yBase: 1.9,
        color: '#ffcc66',
        initAngle: 5.0,
        flapSeed: 5.03,
      },
    ],
    [half]
  );

  const benchData = useMemo(
    () => [
      { x: 0, z: half * 0.45, rotY: Math.PI },
      { x: 0, z: -half * 0.45, rotY: 0 },
      { x: half * 0.45, z: 0, rotY: -Math.PI / 2 },
      { x: -half * 0.45, z: 0, rotY: Math.PI / 2 },
    ],
    [half]
  );

  const lampData = useMemo(
    () => [
      { x: treeOffset * 0.55, z: -treeOffset * 0.55 },
      { x: -treeOffset * 0.55, z: treeOffset * 0.55 },
      { x: treeOffset * 0.55, z: treeOffset * 0.55 },
      { x: -treeOffset * 0.55, z: -treeOffset * 0.55 },
    ],
    [treeOffset]
  );

  const flowerBedData = useMemo(
    () => [
      { x: treeOffset * 0.82, z: 0 },
      { x: -treeOffset * 0.82, z: 0 },
      { x: 0, z: treeOffset * 0.82 },
      { x: 0, z: -treeOffset * 0.82 },
    ],
    [treeOffset]
  );

  return (
    <>
      {petalData.map((p, i) => (
        <Petal key={i} {...p} />
      ))}

      <CherryTree x={treeOffset} z={treeOffset} scale={1} />
      <CherryTree x={-treeOffset} z={-treeOffset} scale={0.9} />
      <CherryTree x={treeOffset} z={-treeOffset} scale={0.95} />
      <CherryTree x={-treeOffset} z={treeOffset} scale={1.05} />

      {benchData.map((b, i) => (
        <Bench key={i} {...b} />
      ))}
      {lampData.map((l, i) => (
        <LampPost key={i} {...l} />
      ))}
      {butterflyData.map((b, i) => (
        <Butterfly key={i} {...b} />
      ))}
      {flowerBedData.map((f, i) => (
        <FlowerBed key={i} {...f} />
      ))}
    </>
  );
}
