'use client';

import ModalWrapper from '@/components/exhibition-gallery/threejs/ModalWrapper';
import { CharacterModel } from '@/hooks/usePlayerSocket';

const CONTROLS = [
  { icon: '🖱️', label: '화면 클릭으로 마우스 조작 시작' },
  { icon: '⌨️', label: 'WASD 또는 방향키로 이동' },
  { icon: '👁️', label: '마우스로 시선 이동' },
  { icon: '🖼️', label: '숫자키 1 - 좋아요 / 숫자키 2 - 작품 다운로드' },
  { icon: 'ESC', label: '마우스 조작 해제' },
];

const MODELS: { value: CharacterModel; label: string; emoji: string }[] = [
  { value: 'human', label: '사람', emoji: '🧑' },
  { value: 'bunny', label: '토끼', emoji: '🐰' },
];

interface GalleryEntryModalProps {
  isAllReady: boolean;
  isInitReady: boolean;
  title: string;
  host: string;
  selectedModel: CharacterModel;
  onModelSelect: (model: CharacterModel) => void;
  onEnter: () => void;
  onBack: () => void;
}

export default function GalleryEntryModal({
  isAllReady,
  isInitReady,
  title,
  host,
  selectedModel,
  onModelSelect,
  onEnter,
  onBack,
}: GalleryEntryModalProps) {

  return (
    <ModalWrapper isOpen height={540} width={448} className="bg-black!">
      <div className="flex h-full flex-col items-center justify-center gap-5 p-8">
        <div className="bg-primary/50 flex h-16 w-16 items-center justify-center rounded-3xl text-3xl">
          🎨
        </div>

        {isInitReady ? (
          <>
            <p className="text-secondary text-[20px] font-bold">
              {title || '전시회'}
            </p>
            <p className="text-secondary/40 -mt-5 text-[14px]">
              {host || '학원'}
            </p>
          </>
        ) : (
          <>
            <div className="h-5 w-20 animate-pulse rounded-md bg-gray-200" />
            <div className="-mt-3 h-3 w-32 animate-pulse rounded-md bg-gray-200" />
          </>
        )}

        <ul className="bg-primary/10 flex w-full flex-col gap-1 rounded-lg p-4">
          {CONTROLS.map(({ icon, label }) => (
            <li key={label} className="text-secondary/40 text-[14px]">
              {icon} {label}
            </li>
          ))}
        </ul>

        <div className="flex w-full gap-3">
          {MODELS.map(({ value, label, emoji }) => (
            <button
              key={value}
              onClick={() => onModelSelect(value)}
              className={`flex flex-1 cursor-pointer flex-col items-center gap-1 rounded-xl py-3 text-sm font-bold transition-all ${
                selectedModel === value
                  ? 'bg-primary/90 text-white'
                  : 'bg-white/10 text-black/50 hover:bg-white/20'
              }`}
            >
              <span className="text-2xl">{emoji}</span>
              {label}
            </button>
          ))}
        </div>

        <div className="flex w-full gap-3">
          <button
            disabled={!isAllReady}
            onClick={onEnter}
            className="bg-primary/90 hover:bg-primary flex-1 cursor-pointer rounded-xl py-3.5 text-center text-[16px] font-bold text-white disabled:cursor-not-allowed disabled:opacity-50"
          >
            {isAllReady ? '입장하기' : '로딩중'}
          </button>
          <button
            onClick={onBack}
            className="bg-secondary/5 text-secondary/70 flex-1 cursor-pointer rounded-xl py-3.5 text-center text-[16px]"
          >
            돌아가기
          </button>
        </div>
      </div>
    </ModalWrapper>
  );
}
