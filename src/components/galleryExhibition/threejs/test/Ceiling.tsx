import React from 'react';

export default function Ceiling({
  size,
  height,
}: {
  size: number;
  height: number;
}) {
  return (
    <>
      <mesh rotation={[Math.PI / 2, 0, 0]} position={[0, height, 0]}>
        <RectLight size={size} />
        <planeGeometry args={[size, size]} />
        <meshStandardMaterial color="#CFC8BD" />
      </mesh>
    </>
  );
}
function RectLight({ size }: { size: number }) {
  const margin = 1;
  const lightWidth = size - margin * 2;
  return (
    <>
      <rectAreaLight
        position={[0, -size / 2 + margin, 0.01]}
        width={lightWidth}
        height={0.3}
        color="#FFF2CC"
        intensity={2}
        rotation={[-Math.PI / 2, -Math.PI, 0]}
      />
      <rectAreaLight
        position={[0, size / 2 - margin, 0.01]}
        width={lightWidth}
        height={0.3}
        color="#FFF2CC"
        intensity={2}
        rotation={[-Math.PI / 2, 0, 0]}
      />

      <rectAreaLight
        position={[-size / 2 + margin, 0.01, 0]}
        width={lightWidth}
        height={0.3}
        color="#FFF2CC"
        intensity={2}
        rotation={[-Math.PI / 2, -Math.PI / 2, 0]}
      />

      <rectAreaLight
        position={[size / 2 - margin, 0.01, 0]}
        width={lightWidth}
        height={0.3}
        color="#FFF2CC"
        intensity={2}
        rotation={[-Math.PI / 2, Math.PI / 2, 0]}
      />
    </>
  );
}
