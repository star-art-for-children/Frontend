import React, { useRef, useState } from 'react';
import { useFrame } from '@react-three/fiber';
import * as THREE from 'three';
import { PlayerInfo, RemotePlayerData } from '@/hooks/usePlayerSocket';
import { TITLE_ICONS } from '@/lib/achievements/definitions';
import { Html } from '@react-three/drei';
import HumanCharacter from './characters/HumanCharacter';
import BunnyCharacter from './characters/BunnyCharacter';
import CartoonCharacter from './characters/CartoonCharacter';

function RemotePlayer({
  playerInfo,
  remotePlayersRef,
}: {
  playerInfo: PlayerInfo;
  remotePlayersRef: React.RefObject<Map<string, RemotePlayerData>>;
}) {
  const groupRef = useRef<THREE.Group>(null);
  const targetPos = useRef(new THREE.Vector3());
  const playerId = playerInfo.userId;
  const playerName = playerInfo.userName;
  const playerModel = playerInfo.model;
  const playerTitle = playerInfo.title;
  const initializedRef = useRef(false);
  const [visible, setVisible] = useState(false);

  useFrame(() => {
    const data = remotePlayersRef.current.get(playerId);
    if (!data || !groupRef.current) return;

    if (!initializedRef.current) {
      groupRef.current.position.set(data.x, 0, data.z);
      groupRef.current.rotation.y = data.yaw;
      initializedRef.current = true;
      setVisible(true);
      return;
    }

    targetPos.current.set(data.x, 0, data.z);
    groupRef.current.position.lerp(targetPos.current, 0.15);

    let diff = data.yaw - groupRef.current.rotation.y;
    diff =
      ((((diff + Math.PI) % (Math.PI * 2)) + Math.PI * 2) % (Math.PI * 2)) -
      Math.PI;
    groupRef.current.rotation.y += diff * 0.15;
  });

  return (
    <group ref={groupRef} visible={visible}>
      {visible && (
        <Html position={[0, 1.9, 0]} center zIndexRange={[30, 0]}>
          <div className="flex flex-col items-center gap-0.5">
            {playerTitle && (
              <div className="bg-primary/90 flex w-fit items-center gap-1 rounded-full px-2 py-0.5 text-[11px] font-bold whitespace-nowrap text-white">
                {TITLE_ICONS[playerTitle] && (
                  <span>{TITLE_ICONS[playerTitle]}</span>
                )}
                {playerTitle}
              </div>
            )}
            <div className="w-fit rounded-full bg-black/50 px-3 py-0.5 text-sm whitespace-nowrap text-white">
              {playerName}
            </div>
          </div>
        </Html>
      )}

      {playerModel === 'human' ? (
        <HumanCharacter />
      ) : playerModel === 'bunny' ? (
        <BunnyCharacter />
      ) : (
        <CartoonCharacter />
      )}
    </group>
  );
}

export default function RemotePlayers({
  playerInfo,
  remotePlayersRef,
}: {
  playerInfo: PlayerInfo[];
  remotePlayersRef: React.RefObject<Map<string, RemotePlayerData>>;
}) {
  return (
    <>
      {playerInfo.map((info) => (
        <RemotePlayer
          key={info.userId}
          playerInfo={info}
          remotePlayersRef={remotePlayersRef}
        />
      ))}
    </>
  );
}
