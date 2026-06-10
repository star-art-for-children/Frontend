'use client';

import { useParams, useRouter } from 'next/navigation';
import { useCallback, useEffect, useRef, useState } from 'react';
import { useGalleryData } from '@/lib/gallery/hooks';
import { usePlayerSocket } from '@/hooks/usePlayerSocket';
import GalleryEntryModal from '@/components/exhibition-gallery/GalleryEntryModal';
import GalleryHUD from '@/components/exhibition-gallery/GalleryHUD';
import Scene2 from '@/components/exhibition-gallery/threejs/Scene';

export default function GalleryExhibitionPage() {
  const { id } = useParams<{ id: string }>();
  const router = useRouter();

  const {
    user,
    exhibitionDetails,
    galleryPreset,
    artworks,
    isInitReady,
    initError,
  } = useGalleryData(id);

  const { sendMove, sendMessage, remotePlayersRef, playerInfo, chatHistory } =
    usePlayerSocket(
      id,
      user?.id ?? null,
      user?.user_metadata?.username ?? 'guest'
    );

  const [isSceneReady, setIsSceneReady] = useState(false);
  const [isMuted, setIsMuted] = useState(false);
  const [started, setStarted] = useState(false);
  const [stampProgress, setStampProgress] = useState({
    collected: 0,
    total: 0,
  });
  const [showStampComplete, setShowStampComplete] = useState(false);
  // 미완료 → 완료로 전환되는 순간에만 축하 모달 노출
  // (이미 완료한 상태로 재진입 시엔 뜨지 않도록 첫 진행률은 baseline 처리)
  const prevCollectedRef = useRef<number | null>(null);
  const isAllReady = isInitReady && isSceneReady;

  const handleStampProgress = useCallback(
    (collected: number, total: number) => {
      setStampProgress({ collected, total });

      if (total > 0) {
        const prev = prevCollectedRef.current;
        prevCollectedRef.current = collected;
        if (prev !== null && collected === total && prev < total) {
          setShowStampComplete(true);
          // 마우스로 모달 버튼을 누를 수 있도록 포인터 잠금 해제
          document.exitPointerLock?.();
        }
      }
    },
    []
  );

  // 완료 모달은 ESC로도 닫기
  useEffect(() => {
    if (!showStampComplete) return;
    const handleKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') setShowStampComplete(false);
    };
    window.addEventListener('keydown', handleKey);
    return () => window.removeEventListener('keydown', handleKey);
  }, [showStampComplete]);

  if (initError) {
    return (
      <div className="fixed inset-0 flex flex-col items-center justify-center gap-4 bg-black text-white">
        <p className="text-lg">{initError}</p>
        <button
          onClick={() => router.back()}
          className="rounded-xl bg-white/10 px-6 py-3 text-sm hover:bg-white/20"
        >
          돌아가기
        </button>
      </div>
    );
  }

  return (
    <div className="fixed inset-0 z-99">
      {!started && (
        <GalleryEntryModal
          isAllReady={isAllReady}
          isInitReady={isInitReady}
          title={exhibitionDetails.title}
          host={exhibitionDetails.host}
          onEnter={() => setStarted(true)}
          onBack={() => router.back()}
        />
      )}

      <GalleryHUD
        title={exhibitionDetails.title}
        host={exhibitionDetails.host}
        isMuted={isMuted}
        onMute={() => setIsMuted(true)}
        onBack={() => router.back()}
        isLogged={!!user}
        myName={user?.user_metadata?.username ?? 'guest'}
        playerNames={playerInfo.map((p) => p.userName)}
        sendMessage={sendMessage}
        chatHistory={chatHistory}
        stampCollected={stampProgress.collected}
        stampTotal={stampProgress.total}
      />

      <div
        className={`h-screen w-screen bg-white ${
          !started || showStampComplete
            ? 'pointer-events-none'
            : 'pointer-events-auto'
        } ${!started ? 'opacity-0' : 'opacity-100'}`}
      >
        {isInitReady && (
          <Scene2
            preset={galleryPreset ?? undefined}
            canLikes={!!user}
            canStamp={!!user}
            onStampProgress={handleStampProgress}
            exhibitionId={id}
            ready={setIsSceneReady}
            init={artworks}
            sendMove={sendMove}
            remotePlayersRef={remotePlayersRef}
            playerInfo={playerInfo}
          />
        )}
      </div>

      {showStampComplete && (
        <div className="absolute inset-0 z-100 flex items-center justify-center bg-black/60 backdrop-blur-sm">
          <div className="animate-in fade-in zoom-in-95 mx-4 flex max-w-sm flex-col items-center gap-3 rounded-3xl bg-white px-8 py-10 text-center shadow-2xl duration-300">
            <span className="text-5xl">🎉</span>
            <p className="text-secondary text-xl font-bold">
              모든 그림을 찾았어요!
            </p>
            <p className="text-secondary/60 text-sm">
              전시관의 작품 {stampProgress.total}개를 모두 스탬프로 모았어요.
            </p>
            <button
              onClick={() => setShowStampComplete(false)}
              className="bg-primary hover:bg-primary/80 mt-2 rounded-xl px-6 py-3 text-sm font-bold text-white transition-colors"
            >
              계속 둘러보기
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
