import React, { useRef } from 'react';
import { useFrame } from '@react-three/fiber';
import * as THREE from 'three';
import { CharacterModel } from '@/hooks/usePlayerSocket';
import { TITLE_ICONS } from '@/lib/achievements/definitions';
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
  myTitle,
}: {
  model: CharacterModel;
  visible: boolean;
  playerPosRef: React.RefObject<THREE.Vector3>;
  playerYawRef: React.RefObject<number>;
  myName?: string;
  myTitle?: string | null;
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
        <Html position={[0, 1.9, 0]} center zIndexRange={[30, 0]}>
          <div className="flex flex-col items-center gap-0.5">
            {myTitle && (
              <div className="bg-primary/90 flex w-fit items-center gap-1 rounded-full px-2 py-0.5 text-[11px] font-bold whitespace-nowrap text-white">
                {TITLE_ICONS[myTitle] && <span>{TITLE_ICONS[myTitle]}</span>}
                {myTitle}
              </div>
            )}
            <div className="text-primary w-fit rounded-full bg-black/50 px-3 py-0.5 text-sm font-bold whitespace-nowrap">
              {myName}
            </div>
          </div>
        </Html>
      )}

      {model === 'human' && <HumanCharacter />}
      {model === 'bunny' && <BunnyCharacter />}
      {model === 'cartoon' && <CartoonCharacter />}
    </group>
  );
}
