import { WebSocketServer, WebSocket } from 'ws';
import { IncomingMessage } from 'http';

const PORT = parseInt(process.env.PORT ?? '3001', 10);

type CharacterModel = 'bunny' | 'human';
type PlayerState = {
  userId: string;
  x: number;
  y: number;
  z: number;
  yaw: number;
};
type Chat = {
  userId: string;
  message: string;
  timestamp: string;
};
type RoomEntry = {
  ws: WebSocket;
  state: PlayerState | null;
  chat: Chat[] | [];
  userName: string;
  model: CharacterModel;
};

// roomId → (userId → RoomEntry)
const rooms = new Map<string, Map<string, RoomEntry>>();
//roomId,Chat
const roomChats = new Map<string, Chat[]>();
const wss = new WebSocketServer({ port: PORT });

function getRoomId(req: IncomingMessage): string | null {
  const match = (req.url ?? '').match(/^\/gallery\/(.+)$/);
  return match ? match[1] : null;
}

function broadcast(
  room: Map<string, RoomEntry>,
  senderId: string,
  raw: string
) {
  room.forEach((entry, id) => {
    if (id !== senderId && entry.ws.readyState === WebSocket.OPEN) {
      entry.ws.send(raw);
    }
  });
}

wss.on('connection', (ws: WebSocket, req: IncomingMessage) => {
  const roomId = getRoomId(req);
  if (!roomId) {
    ws.close(1008, 'invalid room');
    return;
  }

  if (!rooms.has(roomId)) rooms.set(roomId, new Map());
  if (!roomChats.has(roomId)) roomChats.set(roomId, []);
  const room = rooms.get(roomId)!;
  const roomChat = roomChats.get(roomId)!;
  let myUserId: string | null = null;

  ws.on('message', (data) => {
    const raw = data.toString();
    let msg: Record<string, unknown>;

    try {
      msg = JSON.parse(raw);
    } catch {
      return;
    }

    const type = msg.type as string;
    const userId = msg.userId as string;
    if (!userId) return;

    if (type === 'join') {
      myUserId = userId;
      const userName = (msg.userName as string) || userId;
      const model = (msg.model as CharacterModel) || 'human';
      room.set(userId, { ws, state: null, chat: [], userName, model });

      console.log(
        `[ws] join  room=${roomId} userId=${userId} total=${room.size}`
      );

      // 기존 플레이어 상태를 신규 접속자에게 전송
      room.forEach((entry, id) => {
        if (id !== userId && ws.readyState === WebSocket.OPEN) {
          ws.send(
            JSON.stringify({
              type: 'join',
              userId: id,
              userName: entry.userName,
              model: entry.model,
            })
          );
          if (entry.state) {
            ws.send(JSON.stringify({ type: 'move', ...entry.state }));
          }
        }
      });

      if (roomChat.length !== 0) {
        ws.send(
          JSON.stringify({
            type: 'messageInit',
            userId,
            messages: roomChat,
          })
        );
      }
      // 다른 플레이어에게 입장 알림
      broadcast(room, userId, raw);
      return;
    }

    if (type === 'message') {
      const chat: Chat = {
        userId,
        timestamp: Date.now().toString(),
        message: msg.message as string,
      };
      if (room.has(userId)) {
        roomChat.push(chat);
        const prevChat = [...room.get(userId)!.chat];
        room.get(userId)!.chat = [...prevChat, chat];
        console.log(roomChat);
      }
      broadcast(room, userId, raw);
    }
    if (type === 'move') {
      const state: PlayerState = {
        userId,
        x: msg.x as number,
        y: msg.y as number,
        z: msg.z as number,
        yaw: msg.yaw as number,
      };

      if (room.has(userId)) {
        room.get(userId)!.state = state;
      }

      broadcast(room, userId, raw);
      return;
    }

    if (type === 'leave') {
      broadcast(room, userId, raw);
      room.delete(userId);
      console.log(
        `[ws] leave room=${roomId} userId=${userId} remaining=${room.size}`
      );
      if (room.size === 0) rooms.delete(roomId);
      return;
    }
  });

  ws.on('close', () => {
    if (!myUserId) return;
    room.delete(myUserId);
    console.log(
      `[ws] closed room=${roomId} userId=${myUserId} remaining=${room.size}`
    );

    // 비정상 종료 시 다른 플레이어에게 퇴장 알림
    broadcast(
      room,
      myUserId,
      JSON.stringify({ type: 'leave', userId: myUserId })
    );
    if (room.size === 0) rooms.delete(roomId);
  });

  ws.on('error', (err) => {
    console.error(`[ws] error room=${roomId}:`, err.message);
  });
});

console.log(`[ws] server listening on ws://localhost:${PORT}`);
