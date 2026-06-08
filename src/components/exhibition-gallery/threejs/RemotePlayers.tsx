import React, { useRef } from 'react';
import { useFrame } from '@react-three/fiber';
import * as THREE from 'three';
import { PlayerInfo, RemotePlayerData } from '@/hooks/usePlayerSocket';
import { Html } from '@react-three/drei';

function RemotePlayer({
  playerInfo,
  remotePlayersRef,
}: {
  playerInfo:PlayerInfo
  remotePlayersRef: React.RefObject<Map<string, RemotePlayerData>>;

}) {
  const groupRef = useRef<THREE.Group>(null);
  const targetPos = useRef(new THREE.Vector3());
  const playerId=playerInfo.userId
  const playerName=playerInfo.userName
  useFrame(() => {
    const data = remotePlayersRef.current.get(playerId);
    if (!data || !groupRef.current) return;

    targetPos.current.set(data.x, 0, data.z);

    groupRef.current.position.lerp(targetPos.current, 0.15);

    groupRef.current.rotation.y = THREE.MathUtils.lerp(
      groupRef.current.rotation.y,
      data.yaw,
      0.15
    );
  });

  return (
    <group ref={groupRef}>
      {/* 몸통 */}
      <Html position={[0, 1.9, 0]} center>
        <div className="rounded-full bg-black/50 px-4 py-0.5 w-fit text-lg text-white whitespace-nowrap">
          {playerName}
        </div>
      </Html>
      <mesh position={[0, 0.7, 0]} castShadow>
        <capsuleGeometry args={[0.25, 0.8, 4, 8]} />
        <meshStandardMaterial color="#4a90e2" roughness={0.8} />
      </mesh>
      {/* 머리 */}
      <mesh position={[0, 1.45, 0]} castShadow>
        <sphereGeometry args={[0.22, 16, 16]} />
        <meshStandardMaterial color="#f5c5a3" roughness={0.7} />
      </mesh>
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
        <RemotePlayer key={info.userId} playerInfo={info} remotePlayersRef={remotePlayersRef} />
      ))}
    </>
  );
}
