'use client';

import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog';
import { buttonVariants } from '@/components/ui/button';
import { cn } from '@/lib/utils';
import Link from 'next/link';

interface CreditSpendDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  cost: number;
  actionLabel: string;
  onConfirm: () => void;
  /** 전달 시 보유 크레딧/부족 안내 문구를 표시하고, 부족하면 계속하기를 막는다. */
  balance?: number;
}

const CreditSpendDialog = ({
  open,
  onOpenChange,
  cost,
  actionLabel,
  onConfirm,
  balance,
}: CreditSpendDialogProps) => {
  const insufficient = balance !== undefined && balance < cost;

  return (
    <AlertDialog open={open} onOpenChange={onOpenChange}>
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle>{actionLabel}</AlertDialogTitle>
          <AlertDialogDescription>
            이 작업은 {cost.toLocaleString()} 크레딧을 사용합니다. 계속할까요?
          </AlertDialogDescription>
        </AlertDialogHeader>
        {balance !== undefined && (
          <p
            className={cn(
              'text-sm',
              insufficient ? 'text-red-500' : 'text-muted-foreground'
            )}
          >
            {insufficient
              ? `크레딧이 부족합니다. (현재 보유 크레딧: ${balance.toLocaleString()})`
              : `현재 보유 크레딧이 ${balance.toLocaleString()}입니다.`}
          </p>
        )}
        <AlertDialogFooter>
          <AlertDialogCancel>취소</AlertDialogCancel>
          {insufficient ? (
            <Link href="/charge" className={buttonVariants()}>
              충전하기
            </Link>
          ) : (
            <AlertDialogAction onClick={onConfirm}>계속하기</AlertDialogAction>
          )}
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
};

export default CreditSpendDialog;
