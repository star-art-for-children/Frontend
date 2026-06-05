export function Rabbit(props: JSX.IntrinsicElements['group']) {
  return (
    <group {...props} dispose={null}>
      <mesh position={[0, 0.22, 0]} scale={[1, 0.85, 1.3]} castShadow>
        <sphereGeometry args={[0.2, 14, 14]} />
        <meshStandardMaterial color="#F5F0E8" />
      </mesh>
      <mesh position={[0, 0.38, 0.18]} castShadow>
        <sphereGeometry args={[0.14, 14, 14]} />
        <meshStandardMaterial color="#F5F0E8" />
      </mesh>
      <mesh
        position={[-0.07, 0.58, 0.16]}
        rotation={[0, 0, -0.15]}
        scale={[0.35, 1, 0.3]}
      >
        <sphereGeometry args={[0.12, 10, 10]} />
        <meshStandardMaterial color="#F5F0E8" />
      </mesh>
      <mesh
        position={[0.07, 0.58, 0.16]}
        rotation={[0, 0, 0.15]}
        scale={[0.35, 1, 0.3]}
      >
        <sphereGeometry args={[0.12, 10, 10]} />
        <meshStandardMaterial color="#F5F0E8" />
      </mesh>
      <mesh position={[-0.05, 0.4, 0.3]}>
        <sphereGeometry args={[0.018, 8, 8]} />
        <meshStandardMaterial color="#222" />
      </mesh>
      <mesh position={[0.05, 0.4, 0.3]}>
        <sphereGeometry args={[0.018, 8, 8]} />
        <meshStandardMaterial color="#222" />
      </mesh>
      <mesh position={[0, 0.36, 0.32]}>
        <sphereGeometry args={[0.018, 8, 8]} />
        <meshStandardMaterial color="#F8AAB8" />
      </mesh>
      <mesh position={[0, 0.22, -0.22]}>
        <sphereGeometry args={[0.07, 10, 10]} />
        <meshStandardMaterial color="#FFFFFF" />
      </mesh>
    </group>
  );
}
