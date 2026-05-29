'use client';

import { useParams, useRouter } from 'next/navigation';
import { useState } from 'react';
import { useGalleryData } from '@/lib/gallery/hooks';
import GalleryEntryModal from '@/components/exhibition-gallery/GalleryEntryModal';
import GalleryHUD from '@/components/exhibition-gallery/GalleryHUD';
import Scene2 from '@/components/exhibition-gallery/threejs/Scene';

export default function GalleryExhibitionPage() {
  const { id } = useParams<{ id: string }>();
  const router = useRouter();

  const { user, exhibitionDetails, artworks, isInitReady, initError } =
    useGalleryData(id);

  const [isSceneReady, setIsSceneReady] = useState(false);
  const [isMuted, setIsMuted] = useState(false);
  const [started, setStarted] = useState(false);

  const isAllReady = isInitReady && isSceneReady;

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
      />

      <div
        className={`h-screen w-screen bg-white ${
          !started
            ? 'pointer-events-none opacity-0'
            : 'pointer-events-auto opacity-100'
        }`}
      >
        {isInitReady && (
          <Scene2
            user={user}
            exhibitionId={id}
            ready={setIsSceneReady}
            init={artworks}
          />
        )}
      </div>
    </div>
  );
}
