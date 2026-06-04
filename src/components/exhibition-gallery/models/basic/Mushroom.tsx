import { useState } from 'react';

const CAP_COLORS = ['#D04040', '#E07A30', '#C460A0', '#F08070'];

const DOT_OFFSETS: [number, number, number][] = [
  [0.18, 0.7, 0.05],
  [-0.15, 0.72, 0.1],
  [0.05, 0.78, -0.18],
  [-0.05, 0.72, 0.2],
  [0.22, 0.72, -0.15],
];

export function Mushroom(props: JSX.IntrinsicElements['group']) {
  const [capColor] = useState(
    () => CAP_COLORS[Math.floor(Math.random() * CAP_COLORS.length)]
  );

  return (
    <group {...props} dispose={null}>
      <mesh position={[0, 0.3, 0]} castShadow>
        <cylinderGeometry args={[0.16, 0.22, 0.6, 10]} />
        <meshStandardMaterial color="#FFF2D8" roughness={0.9} />
      </mesh>
      <mesh position={[0, 0.65, 0]} castShadow>
        <sphereGeometry args={[0.42, 16, 12, 0, Math.PI * 2, 0, Math.PI / 2]} />
        <meshStandardMaterial color={capColor} roughness={0.75} />
      </mesh>
      {DOT_OFFSETS.map((p, i) => (
        <mesh key={i} position={p}>
          <sphereGeometry args={[0.05, 8, 8]} />
          <meshStandardMaterial color="#FFFFFF" />
        </mesh>
      ))}
    </group>
  );
}
