'use client';

import { Plus, Upload } from 'lucide-react';
import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/button';
import WorkFormBox from './workFormBox';
import {
  Dialog,
  DialogClose,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import ImageUploadBox from './imageUploadBox';

interface AddWorkDialogProps {
  triggerLabel?: string;
  triggerClassName?: string;
}

const fieldClass =
  'text-secondary placeholder:text-secondary/40 w-full rounded-xl border border-gray-200 bg-surface px-4 py-3 text-sm outline-none focus:border-[#F5A623] focus:bg-white';

export default function AddWorkDialog({
  triggerLabel = '작품 추가',
  triggerClassName,
}: AddWorkDialogProps) {
  return (
    <Dialog>
      <DialogTrigger
        render={<Button className={cn('rounded-xl', triggerClassName)} />}
      >
        <Plus className="h-4 w-4" />
        {triggerLabel}
      </DialogTrigger>

      <DialogContent className="max-h-[90vh] w-[calc(100%-2rem)] max-w-xl overflow-y-auto sm:max-w-xl">
        <DialogHeader>
          <DialogTitle className="text-secondary text-lg font-bold">
            작품 등록
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-5 py-1">
          <WorkFormBox label="작품 이미지" essential>
            <ImageUploadBox />
          </WorkFormBox>

          <WorkFormBox label="작품명" essential>
            <input
              type="text"
              placeholder="작품 제목을 입력하세요"
              className={fieldClass}
            />
          </WorkFormBox>

          <WorkFormBox label="작가명" essential>
            <input type="text" placeholder="학생 이름" className={fieldClass} />
          </WorkFormBox>

          <WorkFormBox label="작가 이메일">
            <input
              type="email"
              placeholder="스타아트 가입 이메일 (있는 경우)"
              className={fieldClass}
            />
            <p className="text-secondary/50 text-xs">
              입력 시 해당 계정의 &apos;내 작품 모아보기&apos;에 표시됩니다
            </p>
          </WorkFormBox>

          <WorkFormBox label="작품 설명">
            <textarea
              placeholder="작품에 대한 이야기를 담아주세요..."
              rows={4}
              className={`${fieldClass} resize-none`}
            />
          </WorkFormBox>
        </div>

        <div className="flex gap-2 pt-2">
          <Button className="flex-1 rounded-xl py-6">추가하기</Button>
          <DialogClose
            render={
              <Button variant="outline" className="rounded-xl px-6 py-6" />
            }
          >
            취소
          </DialogClose>
        </div>
      </DialogContent>
    </Dialog>
  );
}
