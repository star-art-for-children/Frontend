'use client';

import { cn } from '@/lib/utils';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { DIALOG_CARD_CLASS, DIALOG_OVERLAY_CLASS } from '@/lib/styles/dialog';

interface AppDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  trigger: React.ReactNode;
  title: string;
  children: React.ReactNode;
  className?: string;
}

export default function AppDialog({
  open,
  onOpenChange,
  trigger,
  title,
  children,
  className,
}: AppDialogProps) {
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      {trigger}
      <DialogContent
        className={cn(
          'w-[calc(100%-2rem)] max-w-lg overflow-hidden p-0!',
          DIALOG_CARD_CLASS,
          className
        )}
        overlayClassName={DIALOG_OVERLAY_CLASS}
        showCloseButton={false}
        initialFocus={false}
      >
        <div className="max-h-[90vh] overflow-y-auto">
          <div className="px-6 pt-6 pb-2">
            <DialogHeader>
              <DialogTitle className="text-secondary text-lg font-bold">
                {title}
              </DialogTitle>
            </DialogHeader>
          </div>
          <div className="px-6 pb-6">{children}</div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
