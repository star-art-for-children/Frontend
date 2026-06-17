'use client';

import { IoIosArrowBack } from 'react-icons/io';
import { HelpCircle, Star, X } from 'lucide-react';
import { useState, useRef, useEffect } from 'react';
import { ChatHistory } from '@/hooks/usePlayerSocket';

interface GalleryHUDProps {
  title: string;
  host: string;
  onBack: () => void;
  myName: string;
  playerNames: string[];
  sendMessage: (message: string) => void;
  chatHistory: ChatHistory[];
  isLogged: boolean;
  stampCollected: number;
  stampTotal: number;
  onOpenStampBook: () => void;
}

export default function GalleryHUD({
  title,
  host,
  onBack,
  myName,
  playerNames,
  sendMessage,
  chatHistory,
  isLogged,
  stampCollected,
  stampTotal,
  onOpenStampBook,
}: GalleryHUDProps) {
  const [showGuide, setShowGuide] = useState(true);
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
            <button
              onClick={onOpenStampBook}
              className="pointer-events-auto flex cursor-pointer items-center gap-2 rounded-2xl bg-black/50 px-3 py-2 backdrop-blur-lg transition-colors hover:bg-black/70"
            >
              <Star size={16} className="fill-[#f4b942] text-[#f4b942]" />
              <span
                key={stampCollected}
                className="inline-block animate-[stamp-bounce_0.5s_ease-out] text-sm font-bold text-white/80"
              >
                스탬프 {stampCollected} / {stampTotal}
              </span>
            </button>
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

      <div className="absolute right-5 bottom-5 flex flex-col items-end gap-2">
        {showGuide && (
          <div className="pointer-events-auto w-fit overflow-hidden rounded-xl bg-black/60 backdrop-blur-lg">
            <div className="flex items-center justify-between border-b border-white/10 px-3 py-2">
              <span className="text-sm font-bold tracking-widest text-white/70 uppercase">
                조작 안내
              </span>
              <button onClick={() => setShowGuide(false)}>
                <X size={20} className="text-white/70 hover:text-white/80" />
              </button>
            </div>
            <div className="flex flex-col gap-0.5 px-3 py-2.5">
              <KeyRow
                label="🖱️"
                desc="화면 클릭으로 마우스 조작 시작"
                variant="icon"
              />
              <KeyRow
                label="⌨️"
                desc="WASD 또는 방향키로 이동"
                variant="icon"
              />
              <KeyRow label="👁️" desc="마우스로 시선 이동" variant="icon" />
            </div>
            <div className="border-t border-white/10" />
            <div className="grid grid-cols-2 gap-x-3 gap-y-0.5 px-3 py-2.5">
              <KeyRow label="1" desc="좋아요" />
              <KeyRow label="2" desc="다운로드" />
              {isLogged && <KeyRow label="3" desc="스탬프" />}
              {isLogged && <KeyRow label="Tab" desc="스탬프북" />}
              <KeyRow label="4" desc="시점 전환" />
              <KeyRow label="5" desc="화면 캡처" />
            </div>
          </div>
        )}
        {!showGuide && (
          <button
            onClick={() => setShowGuide(true)}
            className="pointer-events-auto rounded-full bg-black/60 p-2 backdrop-blur-lg hover:bg-black/80"
          >
            <HelpCircle size={18} className="text-white/70" />
          </button>
        )}
      </div>
    </div>
  );
}

function KeyRow({
  label,
  desc,
  variant = 'key',
}: {
  label: string;
  desc: string;
  variant?: 'key' | 'icon';
}) {
  return (
    <div className="flex items-center gap-2.5 py-0.5">
      {variant === 'key' ? (
        <span className="flex min-w-8 items-center justify-center rounded-md border border-white/20 bg-white/10 px-1.5 py-0.5 text-[11px] font-bold text-white/70">
          {label}
        </span>
      ) : (
        <span className="w-5 text-center text-sm leading-none">{label}</span>
      )}
      <span className="text-[13px] text-white/60">{desc}</span>
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
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      if (e.key === 'Enter' && document.activeElement !== inputRef.current) {
        document.exitPointerLock();
        inputRef.current?.focus();
      }
    };
    window.addEventListener('keydown', handler);
    return () => window.removeEventListener('keydown', handler);
  }, []);

  const messageHandler = (msg: string) => {
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
          ref={inputRef}
          value={msg}
          onChange={(e) => setMsg(e.target.value)}
          onClick={(e) => e.stopPropagation()}
          onKeyDown={(e) => {
            if (
              e.key === 'Enter' &&
              !e.nativeEvent.isComposing &&
              msg.trim().length !== 0
            ) {
              messageHandler(msg);
              setMsg('');
            }
          }}
          placeholder="메시지 입력..."
          className="flex-1 rounded-lg bg-white/10 px-3 py-1.5 text-sm text-white placeholder-white/30 outline-none"
        />
        <button
          disabled={!msg.trim().length}
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
