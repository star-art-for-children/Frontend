'use client';

import { likesToggle } from '@/lib/artwork/service';
import { useOptimisticLike } from '@/hooks/useOptimisticLike';
import { useImageDownload } from '@/hooks/useImageDownload';
import { Artwork } from '@/types/artwork';
import ArtworkDetailContent from '@/components/ui/ArtworkDetailContent';

interface ArtworkModalProps {
  artwork: Artwork;
  onClose: () => void;
  onLikeChange?: (liked: boolean, newCount: number) => void;
  isLoggedIn?: boolean;
}

export default function ArtworkModal({
  artwork,
  onClose,
  onLikeChange,
  isLoggedIn,
}: ArtworkModalProps) {
  const {
    liked,
    likes: likesCount,
    isPending,
    toggle: handleLike,
  } = useOptimisticLike({
    initialLiked: artwork.isLiked,
    initialLikes: artwork.likesCount,
    onToggle: () => likesToggle(artwork.exhibitionId, artwork.id),
    onSuccess: (nextLiked, nextLikes) => onLikeChange?.(nextLiked, nextLikes),
  });

  const { download } = useImageDownload();

  const handleDownload = async () => {
    try {
      await download(artwork.imageUrl, `${artwork.title}.jpg`);
    } catch (e) {
      console.error('이미지 다운로드 실패:', e);
    }
  };

  return (
    <ArtworkDetailContent
      image={artwork.imageUrl}
      title={artwork.title}
      artist={artwork.artist}
      description={artwork.description}
      likes={likesCount}
      liked={liked}
      isPending={isPending}
      isLoggedIn={isLoggedIn}
      exhibitionTitle={artwork.exhibitionTitle}
      host={artwork.academyName}
      onClose={onClose}
      onLike={handleLike}
      onDownload={handleDownload}
    />
  );
}
