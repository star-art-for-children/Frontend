export function Squirrel(props: JSX.IntrinsicElements['group']) {
  return (
    <group {...props} dispose={null}>
      <mesh position={[0, 0.2, 0]} scale={[1, 0.9, 1.2]} castShadow>
        <sphereGeometry args={[0.18, 14, 14]} />
        <meshStandardMaterial color="#B8704A" />
      </mesh>
      <mesh position={[0, 0.34, 0.16]} castShadow>
        <sphereGeometry args={[0.14, 14, 14]} />
        <meshStandardMaterial color="#B8704A" />
      </mesh>
      <mesh position={[-0.08, 0.45, 0.16]}>
        <coneGeometry args={[0.05, 0.1, 6]} />
        <meshStandardMaterial color="#B8704A" />
      </mesh>
      <mesh position={[0.08, 0.45, 0.16]}>
        <coneGeometry args={[0.05, 0.1, 6]} />
        <meshStandardMaterial color="#B8704A" />
      </mesh>
      <mesh position={[-0.05, 0.36, 0.27]}>
        <sphereGeometry args={[0.016, 8, 8]} />
        <meshStandardMaterial color="#222" />
      </mesh>
      <mesh position={[0.05, 0.36, 0.27]}>
        <sphereGeometry args={[0.016, 8, 8]} />
        <meshStandardMaterial color="#222" />
      </mesh>
      <mesh position={[0, 0.38, -0.22]} scale={[1, 1.6, 0.7]} castShadow>
        <sphereGeometry args={[0.16, 14, 14]} />
        <meshStandardMaterial color="#C58860" />
      </mesh>
      <mesh position={[0, 0.55, -0.25]} scale={[0.8, 1, 0.6]}>
        <sphereGeometry args={[0.13, 14, 14]} />
        <meshStandardMaterial color="#C58860" />
      </mesh>
    </group>
  );
}
