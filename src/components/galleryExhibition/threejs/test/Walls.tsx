import React from 'react';
import { WAllType } from '../../../../types/gallery';

export default function Walls({ walls }: { walls: WAllType[] }) {
  return (
    <>
      {walls.map((wall, i) => {
        return (
          <group key={i} position={wall.pos} rotation={wall.rot}>
            <mesh receiveShadow>
              <boxGeometry args={wall.boxSize} />
              <meshStandardMaterial color={wall.color} />
            </mesh>
          </group>
        );
      })}
    </>
  );
}
