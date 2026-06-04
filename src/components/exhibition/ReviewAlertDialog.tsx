'use client';

import { Trash2 } from 'lucide-react';
import ConfirmDialog from '@/components/shared/ConfirmDialog';

interface ReviewAlertDialogProps {
  isDeleting: boolean;
  onAction: () => void | Promise<void>;
}

const ReviewAlertDialog = ({
  isDeleting,
  onAction,
}: ReviewAlertDialogProps) => {
  return (
    <ConfirmDialog
      trigger={
        <button
          aria-label="후기 삭제"
          className="text-secondary/40 hover:text-secondary/80 hover:bg-secondary/5 flex h-8 w-8 shrink-0 items-center justify-center rounded-full transition-colors"
        >
          <Trash2 className="h-4 w-4" />
        </button>
      }
      icon={<Trash2 className="h-4 w-4" />}
      iconContainerClassName="bg-red-100 text-red-500"
      title="후기 삭제"
      description={
        <>
          후기를 삭제하시겠습니까?
          <br />
          삭제 후 복원할 수 없습니다.
        </>
      }
      actionLabel="삭제하기"
      pendingLabel="삭제중.."
      actionClassName="bg-red-500 hover:bg-red-600 text-white"
      isPending={isDeleting}
      onAction={onAction}
    />
  );
};

export default ReviewAlertDialog;
