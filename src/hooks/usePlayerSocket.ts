import { useEffect, useRef, useCallback, useState } from 'react';
import * as THREE from 'three';

export type SendMoveFn = (camera: THREE.Camera) => void;
export type CharacterModel = 'bunny' | 'human';

export type RemotePlayerData = {
  x: number;
  y: number;
  z: number;
  yaw: number;
};

export type PlayerInfo = { userId: string; userName: string; model: CharacterModel };

export type ChatHistory = { userId: string; userName: string; message: string };

type OutboundMessage =
  | { type: 'join'; userId: string; userName: string; model: CharacterModel }
  | { type: 'leave'; userId: string }
  | { type: 'move'; userId: string; x: number; y: number; z: number; yaw: number }
  | { type: 'message'; userId: string; message: string };

type InboundMessage =
  | { type: 'move'; userId: string; x: number; y: number; z: number; yaw: number }
  | { type: 'join'; userId: string; userName: string; model: CharacterModel }
  | { type: 'leave'; userId: string }
  | { type: 'message'; userId: string; message: string };

const THROTTLE_MS = 50;
const _forward = new THREE.Vector3();

export function usePlayerSocket(
  exhibitionId: string,
  userId: string | null,
  userName: string | null,
  model: CharacterModel = 'human'
) {
  const wsRef = useRef<WebSocket | null>(null);
  const lastSentAt = useRef(0);

  const remotePlayersRef = useRef<Map<string, RemotePlayerData>>(new Map());
  const userNamesRef = useRef<Map<string, string>>(new Map());

  const [playerInfo, setPlayerInfo] = useState<PlayerInfo[]>([]);
  const [chatHistory, setChatHistory] = useState<ChatHistory[]>([]);

  const send = useRef((msg: OutboundMessage) => {
    const ws = wsRef.current;
    if (!ws || ws.readyState !== WebSocket.OPEN) return;
    ws.send(JSON.stringify(msg));
  });

  useEffect(() => {
    if (!userId) return;

    remotePlayersRef.current.clear();
    userNamesRef.current.clear();
    // eslint-disable-next-line react-hooks/set-state-in-effect
    setChatHistory([]);
    setPlayerInfo([]);

    const url = `${process.env.NEXT_PUBLIC_WS_URL}/gallery/${exhibitionId}`;
    const ws = new WebSocket(url);
    wsRef.current = ws;

    ws.onopen = () => {
      const myName = userName ?? userId;
      ws.send(JSON.stringify({ type: 'join', userId, userName: myName, model }));
    };

    ws.onmessage = (e: MessageEvent) => {
      const msg: InboundMessage = JSON.parse(e.data);

      if (msg.userId === userId) return;

      if (msg.type === 'move') {
        remotePlayersRef.current.set(msg.userId, {
          x: msg.x,
          y: msg.y,
          z: msg.z,
          yaw: msg.yaw,
        });
      } else if (msg.type === 'message') {
        const senderName = userNamesRef.current.get(msg.userId) ?? msg.userId;
        setChatHistory((prev) => [
          ...prev,
          { userId: msg.userId, userName: senderName, message: msg.message },
        ]);
      } else if (msg.type === 'join') {
        userNamesRef.current.set(msg.userId, msg.userName);
        setPlayerInfo((prev) =>
          prev.find((p) => p.userId === msg.userId)
            ? prev
            : [...prev, { userId: msg.userId, userName: msg.userName, model: msg.model }]
        );
      } else if (msg.type === 'leave') {
        remotePlayersRef.current.delete(msg.userId);
        userNamesRef.current.delete(msg.userId);
        setPlayerInfo((prev) => prev.filter((p) => p.userId !== msg.userId));
      }
    };

    ws.onclose = () => {
      if (wsRef.current === ws) wsRef.current = null;
    };

    return () => {
      if (ws.readyState === WebSocket.OPEN) {
        ws.send(JSON.stringify({ type: 'leave', userId }));
      }
      ws.close();
    };
  }, [exhibitionId, userId, userName, model]);

  const sendMove = useCallback(
    (camera: THREE.Camera) => {
      if (!userId) return;
      const now = Date.now();
      if (now - lastSentAt.current < THROTTLE_MS) return;
      lastSentAt.current = now;

      camera.getWorldDirection(_forward);

      send.current({
        type: 'move',
        userId,
        x: camera.position.x,
        y: camera.position.y,
        z: camera.position.z,
        yaw: Math.atan2(_forward.x, _forward.z),
      });
    },
    [userId]
  );

  const sendMessage = useCallback(
    (message: string) => {
      if (!userId) return;

      send.current({ type: 'message', userId, message });
      setChatHistory((prev) => [
        ...prev,
        { userId, userName: userName ?? userId, message },
      ]);
    },
    [userId, userName]
  );

  return { sendMove, sendMessage, remotePlayersRef, playerInfo, chatHistory };
}
