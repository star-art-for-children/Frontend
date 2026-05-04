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

interface ManageAlertDialogProps {
  trigger: ReactElement;
  icon: ReactNode;
  iconContainerClassName?: string;
  title: string;
  description: ReactNode;
  actionLabel: string;
  actionClassName?: string;
  onAction?: () => void;
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
}: ManageAlertDialogProps) {
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
            onClick={onAction}
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
