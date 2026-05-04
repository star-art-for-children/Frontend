'use client';

import { useState } from 'react';
import { TriangleAlert, X } from 'lucide-react';
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
import { Button } from '@/components/ui/button';

export default function FinishAlertDialog() {
  const [open, setOpen] = useState(false);

  return (
    <AlertDialog open={open} onOpenChange={setOpen}>
      <AlertDialogTrigger
        render={
          <Button
            size="lg"
            variant="destructive"
            className="shrink-0 rounded-xl"
          />
        }
      >
        <X className="h-4 w-4" />
        전시회 종료
      </AlertDialogTrigger>

      <AlertDialogContent
        size="sm"
        className="w-[calc(100%-2rem)] max-w-sm! rounded-2xl p-6"
      >
        <AlertDialogHeader className="sm:place-items-center sm:text-center">
          <AlertDialogMedia className="bg-primary/10 text-primary mx-auto size-16 rounded-2xl">
            <TriangleAlert stroke="#FF6900" />
          </AlertDialogMedia>
          <AlertDialogTitle className="text-secondary text-xl font-bold">
            전시회 종료
          </AlertDialogTitle>
          <AlertDialogDescription>
            전시회를 종료하면 관람객이 더 이상 입장할 수 없습니다.
            <br />
            정말 종료하시겠습니까?
          </AlertDialogDescription>
        </AlertDialogHeader>

        <div className="mt-2 grid grid-cols-2 gap-3">
          <AlertDialogAction
            className="rounded-xl bg-[#FF6900] py-6 text-base font-semibold hover:bg-[#F64900]"
            onClick={() => setOpen(false)}
          >
            종료하기
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
