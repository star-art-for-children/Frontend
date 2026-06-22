'use client';

import { TriangleAlert, X } from 'lucide-react';
import { useRouter } from 'next/navigation';
import { buttonVariants } from '@/components/ui/button';
import ConfirmDialog from '@/components/shared/ConfirmDialog';
import { todayKST } from '@/lib/exhibition/dateStatus';
import { endExhibition } from '@/lib/exhibition/service';
import { cn } from '@/lib/utils';

interface EndExhibitionDialogProps {
  exhibitionId: string;
  startDate: string;
}

const EndExhibitionDialog = ({
  exhibitionId,
  startDate,
}: EndExhibitionDialogProps) => {
  const router = useRouter();

  const handleEnd = async () => {
    if (todayKST() === startDate) {
      alert('전시 시작 당일에는 종료할 수 없습니다.');
      return;
    }

    try {
      await endExhibition(exhibitionId);
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
            buttonVariants({ variant: 'destructive', size: 'lg' }),
            'shrink-0 rounded-xl'
          )}
        >
          <X className="h-4 w-4" />
          전시회 종료
        </button>
      }
      icon={<TriangleAlert stroke="#FF6900" />}
      iconContainerClassName="bg-primary/10 text-primary"
      title="전시회 종료"
      description={
        <>
          전시를 종료하면 <strong>지금 즉시 ‘종료된 전시’</strong>로 표시되어
          <br />
          관람객이 더 이상 입장할 수 없습니다.
          <br />
          이 작업은 되돌릴 수 없습니다. 정말 종료하시겠습니까?
        </>
      }
      actionLabel="종료하기"
      actionClassName="bg-[#FF6900] hover:bg-[#F64900] text-white"
      onAction={handleEnd}
    />
  );
};

export default EndExhibitionDialog;
