'use client';

import Image from 'next/image';
import { useState } from 'react';
import { likesToggle } from '@/lib/artwork/service';
import { useOptimisticLike } from '@/hooks/useOptimisticLike';
import { useImageDownload } from '@/hooks/useImageDownload';
import ArtworkDetailContent from '@/components/ui/ArtworkDetailContent';

export interface Work {
  id: string;
  title: string;
  artist: string;
  image: string;
  description?: string;
  likes: number;
  liked: boolean;
}

interface WorkDialogProps {
  work: Work;
  exhibitionId: string;
  exhibitionTitle: string;
  exhibitionHost: string;
  isLoggedIn?: boolean;
}

export default function WorkDialog({
  work,
  exhibitionId,
  exhibitionTitle,
  exhibitionHost,
  isLoggedIn,
}: WorkDialogProps) {
  const [open, setOpen] = useState(false);

  const {
    liked,
    likes,
    isPending,
    toggle: handleLike,
  } = useOptimisticLike({
    initialLiked: work.liked,
    initialLikes: work.likes,
    onToggle: () => likesToggle(exhibitionId, work.id),
    refreshOnSuccess: true,
  });

  const { download } = useImageDownload();

  const handleDownload = async () => {
    try {
      await download(work.image, `${work.title}.jpg`);
    } catch (err) {
      console.error('Image Download Error', err);
      alert('이미지 다운로드에 실패했습니다. 다시 시도해주세요.');
    }
  };

  return (
    <>
      <button
        onClick={() => setOpen(true)}
        className="group flex w-full flex-col overflow-hidden rounded-2xl bg-white text-left shadow-[0_2px_8px_rgba(44,40,38,0.06)] transition-all hover:shadow-[0_8px_24px_rgba(44,40,38,0.12)]"
      >
        <div className="relative aspect-4/3 overflow-hidden bg-[#F5EFE0]">
          <Image
            src={work.image}
            alt={work.title}
            fill
            sizes="(min-width: 1024px) 25vw, (min-width: 640px) 50vw, 100vw"
            className="object-cover transition-transform duration-300 group-hover:scale-105"
          />
        </div>
        <div className="p-4">
          <h3 className="text-secondary truncate font-bold">{work.title}</h3>
          <p className="text-secondary/60 mt-1 truncate text-sm">
            {work.artist}
          </p>
        </div>
      </button>

      {open && (
        <ArtworkDetailContent
          image={work.image}
          title={work.title}
          artist={work.artist}
          description={work.description}
          likes={likes}
          liked={liked}
          isPending={isPending}
          isLoggedIn={isLoggedIn}
          exhibitionTitle={exhibitionTitle}
          host={exhibitionHost}
          onClose={() => setOpen(false)}
          onLike={handleLike}
          onDownload={handleDownload}
        />
      )}
    </>
  );
}
