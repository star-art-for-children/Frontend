import { WAllType } from '@/types/gallery';

export default function Walls({ walls }: { walls: WAllType[] }) {
  return (
    <>
      {walls.map((wall, i) => {
        return (
          <group key={i} position={wall.pos} rotation={wall.rot}>
            <mesh castShadow receiveShadow>
              <boxGeometry args={wall.boxSize} />
              <meshStandardMaterial
                color={wall.color}
                roughness={0.85}
                metalness={0.02}
              />
            </mesh>
          </group>
        );
      })}
    </>
  );
}
