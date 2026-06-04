export function TreeStump(props: JSX.IntrinsicElements['group']) {
  return (
    <group {...props} dispose={null}>
      <mesh position={[0, 0.35, 0]} castShadow>
        <cylinderGeometry args={[0.5, 0.55, 0.7, 14]} />
        <meshStandardMaterial color="#6B4A2A" roughness={0.95} />
      </mesh>
      <mesh position={[0, 0.701, 0]}>
        <cylinderGeometry args={[0.48, 0.48, 0.02, 14]} />
        <meshStandardMaterial color="#D4A574" roughness={0.95} />
      </mesh>
      <mesh position={[0, 0.711, 0]}>
        <torusGeometry args={[0.25, 0.012, 6, 14]} />
        <meshStandardMaterial color="#A07550" />
      </mesh>
    </group>
  );
}
