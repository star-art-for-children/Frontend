'use client';

import { useParams, useRouter } from 'next/navigation';
import { useCallback, useEffect, useRef, useState } from 'react';
import { Star } from 'lucide-react';
import { useGalleryData } from '@/lib/gallery/hooks';
import { usePlayerSocket, CharacterModel } from '@/hooks/usePlayerSocket';
import GalleryEntryModal from '@/components/exhibition-gallery/GalleryEntryModal';
import GalleryHUD from '@/components/exhibition-gallery/GalleryHUD';
import StampBook from '@/components/exhibition-gallery/StampBook';
import Scene2 from '@/components/exhibition-gallery/threejs/Scene';
import { GalleryUIArtworkProps } from '@/types/gallery';
import {
  fetchMyAchievements,
  updateSelectedTitle,
  type MyAchievements,
} from '@/lib/achievements/client';

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

  const [selectedModel, setSelectedModel] = useState<CharacterModel>('human');

  const { sendMove, sendMessage, remotePlayersRef, playerInfo, chatHistory } =
    usePlayerSocket(
      id,
      user?.id ?? null,
      user?.user_metadata?.username ?? 'guest',
      selectedModel
    );

  const [isSceneReady, setIsSceneReady] = useState(false);
  const [soundOn, setSoundOn] = useState(true);
  const [volume, setVolume] = useState(0.15);
  const soundOnRef = useRef(soundOn);
  const volumeRef = useRef(volume);
  const [started, setStarted] = useState(false);
  const [isThirdPerson, setIsThirdPerson] = useState(false);
  const [stampArtworks, setStampArtworks] = useState<GalleryUIArtworkProps[]>(
    []
  );
  const [showStampComplete, setShowStampComplete] = useState(false);
  const [showStampBook, setShowStampBook] = useState(false);
  const [achievement, setAchievement] = useState<MyAchievements | null>(null);
  // 도장 연출: key를 증가시켜 재마운트 → 애니메이션 재생
  const [stampFxId, setStampFxId] = useState(0);
  const stampAudioRef = useRef<HTMLAudioElement | null>(null);
  const bookOpenAudioRef = useRef<HTMLAudioElement | null>(null);
  const bookCloseAudioRef = useRef<HTMLAudioElement | null>(null);
  const completeAudioRef = useRef<HTMLAudioElement | null>(null);
  // 스탬프북 열림 상태를 이벤트/콜백에서 최신값으로 참조 (중복 소리 방지)
  const showStampBookRef = useRef(showStampBook);
  // 미완료 → 완료로 전환되는 순간에만 축하 모달 노출
  // (이미 완료한 상태로 재진입 시엔 뜨지 않도록 첫 진행률은 baseline 처리)
  const prevCollectedRef = useRef<number | null>(null);
  const completeTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const isAllReady = isInitReady && isSceneReady;
  const myName = user?.user_metadata?.username ?? 'guest';

  const stampCollected = stampArtworks.filter((x) => x.stampedByMe).length;
  const stampTotal = stampArtworks.length;

  // 효과음 재생 헬퍼 — 음소거/볼륨 설정(soundOnRef/volumeRef) 반영
  const playSound = useCallback((audio: HTMLAudioElement | null) => {
    if (!audio || !soundOnRef.current) return;
    audio.currentTime = 0;
    audio.volume = volumeRef.current;
    audio.play().catch(() => {});
  }, []);

  const handleStampProgress = useCallback(
    (artworks: GalleryUIArtworkProps[]) => {
      setStampArtworks(artworks);

      const total = artworks.length;
      if (total === 0) return;

      const collected = artworks.filter((x) => x.stampedByMe).length;
      const prev = prevCollectedRef.current;
      prevCollectedRef.current = collected;
      if (prev === null) return;

      // 새 스탬프 획득 → 도장 쾅 연출 + 도구가 닿는 순간(~0.16s) 효과음
      if (collected > prev) {
        setStampFxId((n) => n + 1);
        setTimeout(() => playSound(stampAudioRef.current), 160);
      }

      // 마지막 스탬프 → 도장 연출이 끝난 뒤 완료 모달 + 축하 사운드
      if (collected === total && prev < total) {
        completeTimerRef.current = setTimeout(() => {
          setShowStampComplete(true);
          playSound(completeAudioRef.current);
          // 마우스로 모달 버튼을 누를 수 있도록 포인터 잠금 해제
          document.exitPointerLock?.();
        }, 1000);
      }
    },
    [playSound]
  );

  // 효과음 on/off·볼륨 최신값을 콜백에서 참조할 수 있도록 ref 동기화
  useEffect(() => {
    soundOnRef.current = soundOn;
  }, [soundOn]);
  useEffect(() => {
    volumeRef.current = volume;
  }, [volume]);

  // 효과음 미리 로드 (도장 / 스탬프북 열기·닫기 / 완주 축하)
  useEffect(() => {
    const load = (src: string) => {
      const a = new Audio(src);
      a.preload = 'auto';
      return a;
    };
    stampAudioRef.current = load('/sounds/stamp.mp3');
    bookOpenAudioRef.current = load('/sounds/book-open.mp3');
    bookCloseAudioRef.current = load('/sounds/book-close.mp3');
    completeAudioRef.current = load('/sounds/complete.mp3');
  }, []);

  // 스탬프북 열림 상태 ref 동기화
  useEffect(() => {
    showStampBookRef.current = showStampBook;
  }, [showStampBook]);

  // 언마운트 시 완료 모달 타이머 정리
  useEffect(() => {
    return () => {
      if (completeTimerRef.current) clearTimeout(completeTimerRef.current);
    };
  }, []);

  // 로그인 유저의 업적 현황 로드 (스탬프북 표시용)
  useEffect(() => {
    if (!user) return;
    fetchMyAchievements()
      .then(setAchievement)
      .catch((e) => console.error('업적 로드 실패', e));
  }, [user]);

  // 수집 개수가 바뀔 때만 업적 현황 갱신
  useEffect(() => {
    if (!user || stampCollected === 0) return;
    fetchMyAchievements()
      .then(setAchievement)
      .catch((e) => console.error('업적 갱신 실패', e));
  }, [user, stampCollected]);

  // 칭호 변경 요청 직렬화 — 연속 클릭 시 PATCH 경쟁으로 최종값이 뒤바뀌는 것 방지
  const titleUpdateInFlightRef = useRef(false);

  const handleSelectTitle = useCallback(async (next: string | null) => {
    if (titleUpdateInFlightRef.current) return;
    titleUpdateInFlightRef.current = true;
    setAchievement((prev) => (prev ? { ...prev, selectedTitle: next } : prev));
    try {
      await updateSelectedTitle(next);
    } catch (e) {
      console.error('칭호 변경 실패', e);
      // 실패 시 서버 상태로 복원
      fetchMyAchievements()
        .then(setAchievement)
        .catch(() => {});
    } finally {
      titleUpdateInFlightRef.current = false;
    }
  }, []);

  // 스탬프북 열기·닫기 (소리 포함). 여러 진입점(버튼·Tab·Esc·닫기버튼)에서 공통 사용
  const openBook = useCallback(() => {
    // 연속 입력 시 중복 소리 방지를 위해 ref를 즉시 갱신 (effect 동기화 전에)
    if (!showStampBookRef.current) {
      showStampBookRef.current = true;
      playSound(bookOpenAudioRef.current);
      setShowStampBook(true);
    }
    document.exitPointerLock?.();
  }, [playSound]);

  const closeBook = useCallback(() => {
    if (showStampBookRef.current) {
      showStampBookRef.current = false;
      playSound(bookCloseAudioRef.current);
      setShowStampBook(false);
    }
  }, [playSound]);

  // Tab: 스탬프북 토글 / ESC: 모달·스탬프북 닫기
  useEffect(() => {
    if (!started) return;
    const handleKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        setShowStampComplete(false);
        closeBook();
        return;
      }
      if (e.key === 'Tab') {
        // 채팅 입력 중에는 무시
        const target = e.target as HTMLElement;
        if (target.tagName === 'INPUT' || target.tagName === 'TEXTAREA') return;
        // 브라우저 기본 포커스 이동 차단
        e.preventDefault();
        // 스탬프북은 로그인 사용자 전용 (스탬프 수집과 동일 정책)
        if (!user) return;
        if (showStampBookRef.current) closeBook();
        else openBook();
      }
    };
    window.addEventListener('keydown', handleKey);
    return () => window.removeEventListener('keydown', handleKey);
  }, [started, user, openBook, closeBook]);

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
          isLogged={!!user}
          isAllReady={isAllReady}
          isInitReady={isInitReady}
          title={exhibitionDetails.title}
          host={exhibitionDetails.host}
          selectedModel={selectedModel}
          onModelSelect={setSelectedModel}
          onEnter={() => setStarted(true)}
          onBack={() => router.back()}
        />
      )}

      <GalleryHUD
        title={exhibitionDetails.title}
        host={exhibitionDetails.host}
        onBack={() => router.back()}
        isLogged={!!user}
        myName={myName}
        playerNames={playerInfo.map((p) => p.userName)}
        sendMessage={sendMessage}
        chatHistory={chatHistory}
        stampCollected={stampCollected}
        stampTotal={stampTotal}
        onOpenStampBook={openBook}
        soundOn={soundOn}
        onToggleSound={() => setSoundOn((v) => !v)}
        volume={volume}
        onVolumeChange={(v) => {
          setVolume(v);
          // 슬라이더로 볼륨을 0보다 올리면 음소거 자동 해제, 0이면 음소거
          setSoundOn(v > 0);
        }}
      />

      <div
        className={`h-screen w-screen bg-white ${
          !started || showStampComplete || showStampBook
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
            selectedModel={selectedModel}
            myName={myName}
            isThirdPerson={isThirdPerson}
            onToggleThirdPerson={() => setIsThirdPerson((v) => !v)}
          />
        )}
      </div>

      {/* 도장 쾅 연출 — slam(낙하) + shake(반동) + ring(잉크 파동) */}
      {stampFxId > 0 && (
        <div
          key={stampFxId}
          className="pointer-events-none absolute inset-0 z-100 flex items-center justify-center"
        >
          {/* 잉크 자국 — 도구가 닿는 순간(0.16s)에 맞춰 등장 */}
          <div className="fill-mode-[both] animate-[stamp-shake_0.35s_ease-out_0.16s]">
            <div className="relative flex h-36 w-36 items-center justify-center">
              {/* 몽글몽글 파동 링 (둥근 점선) */}
              <div className="absolute inset-0 animate-[stamp-ring_0.9s_ease-out_0.16s_both] rounded-full border-[5px] border-dotted border-[#ff8a5c]/70" />
              {/* 도장 자국 — 부드러운 코랄 + 둥근 점선 */}
              <div
                className="flex h-full w-full animate-[stamp-slam_1.1s_linear_0.16s_both] flex-col items-center justify-center gap-1 rounded-full border-[6px] border-dotted border-[#ff8a5c]"
                style={{
                  background:
                    'radial-gradient(circle at 50% 45%, rgba(255,138,92,0.18), rgba(255,138,92,0.05) 70%)',
                }}
              >
                <Star size={30} className="fill-[#ff8a5c] text-[#ff8a5c]" />
                <span className="text-lg font-extrabold text-[#ff7043] drop-shadow-[0_1px_2px_rgba(255,255,255,0.9)]">
                  찾았어요!
                </span>
              </div>
            </div>
          </div>

          {/* 도장 도구 — 위에서 쾅 내려찍고 빠짐 (잉크 자국 위에 겹침) */}
          <div
            className="absolute left-1/2 -translate-x-1/2"
            style={{ top: '30%' }}
          >
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src="/images/stamp.svg"
              alt=""
              className="h-40 w-40 animate-[stamp-tool-slam_0.9s_ease-out_forwards] drop-shadow-[0_8px_12px_rgba(0,0,0,0.25)]"
            />
          </div>
        </div>
      )}

      {/* 스탬프북은 로그인 사용자에게만 노출 */}
      {showStampBook && user && (
        <StampBook
          artworks={stampArtworks}
          achievement={achievement}
          onSelectTitle={handleSelectTitle}
          onClose={closeBook}
        />
      )}

      {showStampComplete && (
        <div className="absolute inset-0 z-100 flex items-center justify-center bg-black/60 backdrop-blur-sm">
          <div className="animate-in fade-in zoom-in-95 mx-4 flex max-w-sm flex-col items-center gap-3 rounded-3xl bg-white px-8 py-10 text-center shadow-2xl duration-300">
            <span className="text-5xl">🎉</span>
            <p className="text-secondary text-xl font-bold">
              모든 그림을 찾았어요!
            </p>
            <p className="text-secondary/60 text-sm">
              전시관의 작품 {stampTotal}개를 모두 스탬프로 모았어요.
            </p>
            <p className="text-primary text-sm font-semibold">
              🏅 마이페이지에서 완주 업적과 칭호를 확인해보세요!
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
