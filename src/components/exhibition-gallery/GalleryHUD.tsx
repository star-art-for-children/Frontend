'use client';

import { IoIosArrowBack } from 'react-icons/io';
import { X } from 'lucide-react';
import { useState } from 'react';
import { ChatHistory } from '@/hooks/usePlayerSocket';

interface GalleryHUDProps {
  title: string;
  host: string;
  isMuted: boolean;
  onMute: () => void;
  onBack: () => void;
  myName: string;
  playerNames: string[];
  sendMessage: (message: string) => void;
  chatHistory: ChatHistory[];
  isLogged: boolean;
  stampCollected: number;
  stampTotal: number;
}

export default function GalleryHUD({
  title,
  host,
  isMuted,
  onMute,
  onBack,
  myName,
  playerNames,
  sendMessage,
  chatHistory,
  isLogged,
  stampCollected,
  stampTotal,
}: GalleryHUDProps) {
  return (
    <div className="pointer-events-none absolute inset-0 z-40 flex w-full items-start p-5">
      <div className={'flex w-full justify-between'}>
        <button
          onClick={(e) => {
            e.preventDefault();
            onBack();
          }}
          className="pointer-events-auto flex cursor-pointer items-center gap-2 rounded-2xl bg-black/50 p-3 backdrop-blur-lg"
        >
          <IoIosArrowBack className="text-lg text-white/80" />
          <div className="flex flex-col">
            <p className="font-bold text-white/80">{title}</p>
            <p className="text-sm text-white/30">{host}</p>
          </div>
        </button>
        <div className="flex flex-col items-end gap-2">
          {isLogged && stampTotal > 0 && (
            <div className="flex items-center gap-2 rounded-2xl bg-black/50 px-3 py-2 backdrop-blur-lg">
              <span className="text-base">🎫</span>
              <span className="text-sm font-bold text-white/80">
                스탬프 {stampCollected} / {stampTotal}
              </span>
            </div>
          )}
          {isLogged && (
            <div className="pointer-events-auto flex cursor-pointer items-center gap-2 rounded-2xl bg-black/50 p-3 backdrop-blur-lg">
              <div className="flex flex-col items-center">
                {[myName, ...playerNames].map((playerId, i) => (
                  <p
                    key={i}
                    className={`font-bold ${playerId === myName ? 'text-yellow-400/80' : 'text-white/80'} `}
                  >
                    {playerId}
                  </p>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>

      {isLogged && (
        <Chat sendMessage={sendMessage} chatHistory={chatHistory} me={myName} />
      )}

      {!isMuted && (
        <div className="absolute bottom-0 left-1/2 flex -translate-x-1/2 items-center gap-2 p-5">
          <div className="flex items-center gap-3 rounded-lg bg-black/50 px-3 py-2 text-[14px] backdrop-blur-lg">
            <p className="text-white/80">숫자키 1 - 좋아요</p>
            <p className="text-white/80">숫자키 2 - 다운로드</p>
            {isLogged && <p className="text-white/80">숫자키 3 - 스탬프</p>}
          </div>
          <button
            onClick={onMute}
            className="pointer-events-auto rounded-full bg-black/50 p-1.5"
          >
            <X size={20} className="text-white/80" />
          </button>
        </div>
      )}
    </div>
  );
}

function Chat({
  sendMessage,
  chatHistory,
  me = 'guest',
}: {
  sendMessage: (msg: string) => void;
  chatHistory: ChatHistory[];
  me: string;
}) {
  const [msg, setMsg] = useState('');
  const messageHandler = (msg: string) => {
    console.log(msg);
    sendMessage(msg);
  };
  return (
    <div
      className="pointer-events-auto absolute bottom-0 left-0 m-5 flex w-72 flex-col gap-2 rounded-2xl bg-black/50 p-3 backdrop-blur-sm"
      onClick={(e) => {
        e.stopPropagation();
        e.nativeEvent.stopImmediatePropagation();
      }}
      onMouseDown={(e) => {
        e.stopPropagation();
        e.nativeEvent.stopImmediatePropagation();
      }}
    >
      {/* 메시지 목록 */}
      <div className="flex max-h-40 flex-col-reverse gap-1 overflow-y-auto">
        {[...chatHistory].reverse().map((x, i) => (
          <div key={i} className="flex gap-2 text-sm">
            <span
              className={`shrink-0 ${me === x.userName ? 'text-yellow-400/80' : 'text-white/80'} font-semibold`}
            >
              {x.userName}
            </span>
            <span className="text-white/90">{x.message}</span>
          </div>
        ))}
      </div>
      {/* 입력창 */}
      <div className="flex gap-2">
        <input
          value={msg}
          onChange={(e) => setMsg(e.target.value)}
          onClick={(e) => e.stopPropagation()}
          onKeyDown={(e) => {
            if (e.key === 'Enter' && !e.nativeEvent.isComposing) {
              messageHandler(msg);
              setMsg('');
            }
          }}
          placeholder="메시지 입력..."
          className="flex-1 rounded-lg bg-white/10 px-3 py-1.5 text-sm text-white placeholder-white/30 outline-none"
        />
        <button
          onClick={(e) => {
            e.preventDefault();
            messageHandler(msg);
            setMsg('');
          }}
          className="rounded-lg bg-white/20 px-3 py-1.5 text-sm text-white/80 hover:bg-white/30"
        >
          전송
        </button>
      </div>
    </div>
  );
}
