'use client';

import { Trash2 } from 'lucide-react';
import { useRouter } from 'next/navigation';
import { buttonVariants } from '@/components/ui/button';
import ConfirmDialog from '@/components/shared/ConfirmDialog';
import { deleteArtworksByArtworkId } from '@/lib/artwork/service';
import { cn } from '@/lib/utils';

interface DeleteArtworkDialogProps {
  exhibitionId: string;
  artworkId: string;
  artworkTitle: string;
}

const DeleteArtworkDialog = ({
  exhibitionId,
  artworkId,
  artworkTitle,
}: DeleteArtworkDialogProps) => {
  const router = useRouter();

  const handleDelete = async () => {
    try {
      await deleteArtworksByArtworkId(exhibitionId, artworkId);
      router.refresh();
    } catch (error) {
      console.log(error);
    }
  };

  return (
    <ConfirmDialog
      trigger={
        <button
          className={cn(
            buttonVariants({ variant: 'surface', size: 'sm' }),
            'flex-1 rounded-lg hover:text-red-500'
          )}
        >
          <Trash2 className="h-3.5 w-3.5" />
          삭제
        </button>
      }
      icon={<Trash2 />}
      iconContainerClassName="bg-red-100 text-red-500"
      title="작품 삭제"
      description={
        <>
          &quot;{artworkTitle}&quot; 작품을 삭제하시겠습니까?
          <br />
          삭제 후 복원할 수 없습니다.
        </>
      }
      actionLabel="삭제하기"
      actionClassName="bg-red-500 hover:bg-red-600 text-white"
      onAction={handleDelete}
    />
  );
};

export default DeleteArtworkDialog;
