import React, { useRef } from 'react';
import { useFrame } from '@react-three/fiber';
import * as THREE from 'three';
import { CharacterModel } from '@/hooks/usePlayerSocket';
import HumanCharacter from './characters/HumanCharacter';
import BunnyCharacter from './characters/BunnyCharacter';
import CartoonCharacter from './characters/CartoonCharacter';
import { Html } from '@react-three/drei';

export default function LocalPlayerCharacter({
  model,
  visible,
  playerPosRef,
  playerYawRef,
  myName,
}: {
  model: CharacterModel;
  visible: boolean;
  playerPosRef: React.RefObject<THREE.Vector3>;
  playerYawRef: React.RefObject<number>;
  myName?: string;
}) {
  const groupRef = useRef<THREE.Group>(null);

  useFrame(() => {
    if (!groupRef.current) return;
    groupRef.current.position.set(
      playerPosRef.current.x,
      0,
      playerPosRef.current.z
    );
    groupRef.current.rotation.y = playerYawRef.current;
  });

  return (
    <group ref={groupRef} visible={visible}>
      {visible && (
        <Html position={[0, 1.9, 0]} center>
          <div className="text-primary w-fit rounded-full bg-black/50 px-3 py-0.5 text-sm font-bold whitespace-nowrap">
            {myName}
          </div>
        </Html>
      )}

      {model === 'human' && <HumanCharacter />}
      {model === 'bunny' && <BunnyCharacter />}
      {model === 'cartoon' && <CartoonCharacter />}
    </group>
  );
}
