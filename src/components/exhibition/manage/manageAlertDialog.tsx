'use client';

import { ReactElement, ReactNode } from 'react';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogHeader,
  AlertDialogMedia,
  AlertDialogTitle,
  AlertDialogTrigger,
} from '@/components/ui/alert-dialog';
import { cn } from '@/lib/utils';
import { deleteArtworksByArtworkId } from '@/service/artworks';
import { useRouter } from 'next/navigation';
import { endExhibition } from '@/service/exhibitions';
import { todayKST } from '@/lib/exhibition/dateStatus';

interface ManageAlertDialogProps {
  trigger: ReactElement;
  icon: ReactNode;
  iconContainerClassName?: string;
  title: string;
  startDate?: string;
  description: ReactNode;
  actionLabel: string;
  artworkId?: string;
  exhibitionId: string;
  actionClassName?: string;
  onAction?: 'deleteArtwork' | 'exhibitionEnd';
}

export default function ManageAlertDialog({
  trigger,
  icon,
  iconContainerClassName,
  title,
  description,
  actionLabel,
  actionClassName,
  onAction,
  artworkId,
  exhibitionId,
  startDate,
}: ManageAlertDialogProps) {
  const router = useRouter();
  const deleteArtworkHandler = async () => {
    if (!artworkId) return;
    try {
      const deletedId = await deleteArtworksByArtworkId(
        exhibitionId,
        artworkId
      );
      console.log(deletedId);
      router.refresh();
    } catch (error) {
      console.log(error);
    }
  };
  const endExhibitionHandler = async () => {
    const today = todayKST();

    if (today === startDate) {
      alert('전시 시작 당일에는 종료할 수 없습니다.');
      return;
    }

    try {
      const updatedId = await endExhibition(exhibitionId);
      console.log(updatedId);
      router.refresh();
    } catch (error) {
      console.log(error);
    }
  };
  const functionMapper = {
    deleteArtwork: deleteArtworkHandler,
    exhibitionEnd: endExhibitionHandler,
  };

  return (
    <AlertDialog>
      <AlertDialogTrigger render={trigger} />

      <AlertDialogContent
        size="sm"
        className="w-[calc(100%-2rem)] max-w-sm! rounded-2xl p-6"
      >
        <AlertDialogHeader className="sm:place-items-center sm:text-center">
          <AlertDialogMedia
            className={cn(
              'mx-auto size-16 rounded-2xl',
              iconContainerClassName
            )}
          >
            {icon}
          </AlertDialogMedia>
          <AlertDialogTitle className="text-secondary text-xl font-bold">
            {title}
          </AlertDialogTitle>
          <AlertDialogDescription>{description}</AlertDialogDescription>
        </AlertDialogHeader>

        <div className="mt-2 grid grid-cols-2 gap-3">
          <AlertDialogAction
            className={cn(
              'rounded-xl py-6 text-base font-semibold',
              actionClassName
            )}
            onClick={onAction && functionMapper[onAction]}
          >
            {actionLabel}
          </AlertDialogAction>
          <AlertDialogCancel
            variant="outline"
            className="text-secondary rounded-xl bg-[#F5EFE0] py-6 text-base hover:bg-[#EDE5D0]"
          >
            취소
          </AlertDialogCancel>
        </div>
      </AlertDialogContent>
    </AlertDialog>
  );
}
