'use client';

import { Pencil } from 'lucide-react';
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
import { useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { Controller, useForm } from 'react-hook-form';
import { putArtWorkByArtWorkId } from '@/service/artworks';
import { ArtworkFormUi } from '@/components/exhibition/manage/addWorkDialog';

interface Work {
  id: string;
  title: string;
  artist_name: string;
  image_url: string;
  email?: string;
  description?: string;
  artist_id?: string;
}

interface EditWorkDialogProps {
  work: Work;
}

const fieldClass =
  'text-secondary placeholder:text-secondary/40 w-full rounded-xl border border-gray-200 bg-surface px-4 py-3 text-sm outline-none focus:border-[#F5A623] focus:bg-white';

export default function EditWorkDialog({ work }: EditWorkDialogProps) {
  const { id } = useParams<{ id: string }>();
  const [open, setOpen] = useState(false);
  const router = useRouter();
  const {
    register,
    control,
    formState: { isValid, isSubmitting },
    handleSubmit,
  } = useForm<ArtworkFormUi>({
    mode: 'onChange',
    defaultValues: {
      artist_id: work.artist_id,
      title: work.title,
      artist_name: work.artist_name,
      description: work.description,
      image_url: work.image_url,
    },
  });
  const submitHandler = async (e: ArtworkFormUi) => {
    const formData = new FormData();
    if (e.artist_id) {
      formData.append('artist_id', e.artist_id);
    }
    if (e.description) {
      formData.append('description', e.description);
    }
    formData.append('artist_name', e.artist_name);
    formData.append('title', e.title);
    formData.append('image_url', e.image_url);
    console.log(e);
    try {
      const editArtWorkId = await putArtWorkByArtWorkId(id, work.id, formData);
      console.log(editArtWorkId);
      setOpen(false);
      router.refresh();
    } catch (e) {
      console.log(e);
    }
  };
  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger
        render={
          <Button
            size="sm"
            variant="surface"
            className="hover:text-primary flex-1 rounded-lg"
          />
        }
      >
        <Pencil className="h-3.5 w-3.5" />
        수정
      </DialogTrigger>

      <DialogContent className="max-h-[90vh] w-[calc(100%-2rem)] max-w-xl overflow-y-auto sm:max-w-lg">
        <DialogHeader>
          <DialogTitle className="text-secondary text-lg font-bold">
            작품 수정
          </DialogTitle>
        </DialogHeader>

        <form onSubmit={handleSubmit(submitHandler)}>
          <div className="space-y-5 py-1">
            <Controller
              name="image_url"
              control={control}
              rules={{ required: true }}
              render={({ field }) => (
                <>
                  <WorkFormBox label="작품 이미지" essential>
                    <ImageUploadBox
                      value={field.value}
                      onChange={field.onChange}
                    />
                  </WorkFormBox>
                </>
              )}
            />

            <WorkFormBox label="작품명" essential>
              <input
                {...register('title', { required: true })}
                type="text"
                className={fieldClass}
              />
            </WorkFormBox>

            <WorkFormBox label="작가명" essential>
              <input
                {...register('artist_name', { required: true })}
                type="text"
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
                {...register('artist_id', { required: false })}
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
                {...register('description')}
                placeholder="작품에 대한 이야기를 담아주세요..."
                rows={4}
                className={`${fieldClass} resize-none`}
              />
            </WorkFormBox>
          </div>

          <div className="flex gap-2 pt-2">
            <Button
              disabled={!isValid || isSubmitting}
              type={'submit'}
              className="flex-1 rounded-xl py-6"
            >
              수정하기
            </Button>
            <DialogClose
              render={
                <Button variant="outline" className="rounded-xl px-6 py-6" />
              }
            >
              취소
            </DialogClose>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}
