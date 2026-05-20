import Image from 'next/image';
import Link from 'next/link';
import { Calendar, CheckCircle, Clock } from 'lucide-react';
import { cn } from '@/lib/utils';
import { formatDate, getStatus } from '@/lib/exhibition/dateStatus';
import { ExhibitionListItem } from '@/types/exhibitionList';
import LikeButton from './LikeButton';

interface ExhibitionCardProps {
  exhibition: ExhibitionListItem;
  isLoggedIn?: boolean;
}

export default function ExhibitionCard({
  exhibition,
  isLoggedIn,
}: ExhibitionCardProps) {
  const { id, title, host, image, startDate, endDate, likes, liked } =
    exhibition;

  const status = getStatus(startDate, endDate ?? undefined);
  const dateText = formatDate(startDate, endDate ?? undefined);

  return (
    <Link
      href={`/exhibitions/${id}`}
      className={cn(
        'group block overflow-hidden rounded-2xl bg-white transition-all',
        'shadow-[0_2px_8px_rgba(44,40,38,0.06)] hover:shadow-[0_8px_24px_rgba(44,40,38,0.12)]'
      )}
    >
      <div className="relative aspect-4/3 overflow-hidden bg-[#F5EFE0]">
        <Image
          src={image || '/images/default_thumb.jpg'}
          alt={title}
          fill
          sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 25vw"
          className={cn(
            'object-cover transition-transform duration-300 group-hover:scale-105',
            status === 'ended' && 'opacity-70 grayscale'
          )}
        />
        {!image && (
          <div className="text-secondary/90 absolute top-1/2 left-1/2 max-w-50 -translate-x-1/2 -translate-y-1/2 rounded-xl bg-white p-4">
            <p className="wrap-break-words line-clamp-3 text-sm">{title}</p>
          </div>
        )}

        {/* 진행중: 좌상단 라벨 */}
        {status === 'ongoing' && (
          <span className="bg-primary text-secondary absolute top-3 left-3 inline-flex items-center rounded-full px-3 py-1 text-xs font-semibold">
            진행중
          </span>
        )}

        {/* 예정된 전시 */}
        {status === 'upcoming' && (
          <>
            <div className="bg-secondary/30 absolute inset-0" />
            <span className="absolute top-1/2 left-1/2 inline-flex -translate-x-1/2 -translate-y-1/2 items-center gap-1.5 rounded-full bg-white/90 px-3 py-1.5 text-xs font-semibold text-[#E09415] backdrop-blur-md">
              <Clock className="h-3.5 w-3.5" />
              예정된 전시
            </span>
          </>
        )}

        {/* 종료된 전시 */}
        {status === 'ended' && (
          <span className="text-secondary absolute top-3 left-3 inline-flex items-center gap-1.5 rounded-full bg-white/90 px-3 py-1.5 text-xs font-semibold backdrop-blur-md">
            <CheckCircle className="h-3.5 w-3.5" />
            종료된 전시
          </span>
        )}
      </div>

      <div className="flex flex-col gap-2 p-4">
        <h3 className="text-secondary text-base font-bold">{title}</h3>
        <p className="text-secondary/60 text-sm">{host}</p>

        <div className="text-secondary/60 mt-2 flex items-center justify-between text-xs">
          <span className="inline-flex items-center gap-1">
            <Calendar className="h-3.5 w-3.5" />
            {dateText}
          </span>
          <LikeButton
            initialLikes={likes}
            initialLiked={liked}
            exhibitionId={exhibition.id}
            isLoggedIn={isLoggedIn}
          />
        </div>
      </div>
    </Link>
  );
}
