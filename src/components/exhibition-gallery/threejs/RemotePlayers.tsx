import React, { useRef, useState } from 'react';
import { useFrame } from '@react-three/fiber';
import * as THREE from 'three';
import { PlayerInfo, RemotePlayerData } from '@/hooks/usePlayerSocket';
import { Html } from '@react-three/drei';
import HumanCharacter from './characters/HumanCharacter';
import BunnyCharacter from '@/components/exhibition-gallery/threejs/characters/BunnyCharacter';

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
        <Html position={[0, 1.9, 0]} center>
          <div className="w-fit rounded-full bg-black/50 px-4 py-0.5 text-lg whitespace-nowrap text-white">
            {playerName}
          </div>
        </Html>
      )}

      {playerModel === 'human' ? <HumanCharacter /> : <BunnyCharacter />}
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
