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
import { Trash2 } from 'lucide-react';

interface ManageAlertDialogProps {
  isDeleting: boolean;
  onAction?: () => void;
}

export default function ReviewAlertDialog({
  onAction,
  isDeleting,
}: ManageAlertDialogProps) {
  return (
    <AlertDialog>
      <AlertDialogTrigger
        aria-label="후기 삭제"
        className="text-secondary/40 hover:text-secondary/80 hover:bg-secondary/5 flex h-8 w-8 shrink-0 items-center justify-center rounded-full transition-colors"
      >
        <Trash2 className="h-4 w-4" />
      </AlertDialogTrigger>

      <AlertDialogContent
        size="sm"
        className="w-[calc(100%-2rem)] max-w-sm! rounded-2xl p-6"
      >
        <AlertDialogHeader className="sm:place-items-center sm:text-center">
          <AlertDialogMedia className="mx-auto size-16 rounded-2xl bg-red-100 text-red-500">
            <Trash2 className="h-4 w-4" />
          </AlertDialogMedia>
          <AlertDialogTitle className="text-secondary text-xl font-bold">
            후기 삭제
          </AlertDialogTitle>
          <AlertDialogDescription>
            후기를 삭제하시겠습니까?
            <br />
            삭제 후 복원할 수 없습니다.
          </AlertDialogDescription>
        </AlertDialogHeader>

        <div className="mt-2 grid grid-cols-2 gap-3">
          <AlertDialogAction
            className="rounded-xl bg-red-500 py-6 text-base font-semibold text-white hover:bg-red-600"
            onClick={onAction}
            disabled={isDeleting}
          >
            {isDeleting ? '삭제중..' : '삭제하기'}
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
