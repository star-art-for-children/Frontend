'use client';

import Image from 'next/image';
import { Pencil, X } from 'lucide-react';
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

interface Work {
  id: string;
  title: string;
  artist: string;
  image: string;
  email?: string;
  description?: string;
}

interface EditWorkDialogProps {
  work: Work;
}

const fieldClass =
  'text-secondary placeholder:text-secondary/40 w-full rounded-xl border border-gray-200 bg-surface px-4 py-3 text-sm outline-none focus:border-[#F5A623] focus:bg-white';

export default function EditWorkDialog({ work }: EditWorkDialogProps) {
  return (
    <Dialog>
      <DialogTrigger
        render={
          <Button size="sm" variant="surface" className="flex-1 rounded-lg" />
        }
      >
        <Pencil className="h-3.5 w-3.5" />
        수정
      </DialogTrigger>

      <DialogContent className="max-h-[90vh] w-[calc(100%-2rem)] max-w-xl overflow-y-auto sm:max-w-xl">
        <DialogHeader>
          <DialogTitle className="text-secondary text-lg font-bold">
            작품 수정
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-5 py-1">
          <WorkFormBox label="작품 이미지" essential>
            <div className="relative aspect-4/3 w-full overflow-hidden rounded-xl bg-[#F5EFE0]">
              <Image
                src={work.image}
                alt={work.title}
                fill
                className="object-cover"
              />
              <button
                type="button"
                className="absolute top-2 right-2 flex h-7 w-7 items-center justify-center rounded-full bg-black/50 text-white transition-colors hover:bg-black/70"
              >
                <X className="h-4 w-4" />
              </button>
            </div>
          </WorkFormBox>

          <WorkFormBox label="작품명" essential>
            <input
              type="text"
              defaultValue={work.title}
              className={fieldClass}
            />
          </WorkFormBox>

          <WorkFormBox label="작가명" essential>
            <input
              type="text"
              defaultValue={work.artist}
              className={fieldClass}
            />
          </WorkFormBox>

          <WorkFormBox
            label={
              <>
                작가 이메일{' '}
                <span className="text-secondary/50 font-normal">(선택)</span>
              </>
            }
          >
            <input
              type="email"
              defaultValue={work.email}
              placeholder="스타아트 가입 이메일 (있는 경우)"
              className={fieldClass}
            />
            <p className="text-secondary/50 text-xs">
              입력 시 해당 계정의 &apos;내 작품 모아보기&apos;에 표시됩니다
            </p>
          </WorkFormBox>

          <WorkFormBox label="작품 설명">
            <textarea
              defaultValue={work.description}
              placeholder="작품에 대한 이야기를 담아주세요..."
              rows={4}
              className={`${fieldClass} resize-none`}
            />
          </WorkFormBox>
        </div>

        <div className="flex gap-2 pt-2">
          <Button className="flex-1 rounded-xl py-6">수정하기</Button>
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
