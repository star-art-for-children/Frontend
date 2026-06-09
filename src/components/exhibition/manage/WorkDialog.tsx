'use client';

import { Pencil, Plus } from 'lucide-react';
import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/button';
import WorkFormBox from './WorkFormBox';
import { DialogClose, DialogTrigger } from '@/components/ui/dialog';
import AppDialog from '@/components/shared/AppDialog';
import ImageUploadBox from '@/components/shared/ImageUploadBox';
import { Controller, useForm } from 'react-hook-form';
import { useParams, useRouter } from 'next/navigation';
import {
  postArtWorksByExhibitionId,
  putArtWorkByArtWorkId,
} from '@/lib/artwork/service';
import { useEffect, useState } from 'react';
import { ArtworkFormUi, ArtworkWithEmail } from '@/types/artwork';

type WorkDialogProps =
  | { mode: 'add'; triggerLabel?: string; triggerClassName?: string }
  | { mode: 'edit'; work: ArtworkWithEmail };

const fieldClass =
  'text-secondary placeholder:text-secondary/40 w-full rounded-xl border border-gray-200 bg-surface px-4 py-3 text-sm outline-none focus:border-[#F5A623] focus:bg-white';

export default function WorkDialog(props: WorkDialogProps) {
  const { id } = useParams<{ id: string }>();
  const [open, setOpen] = useState(false);
  const router = useRouter();

  const work = props.mode === 'edit' ? props.work : null;
  const addTriggerLabel =
    props.mode === 'add' ? (props.triggerLabel ?? '작품 추가') : '';
  const addTriggerClassName =
    props.mode === 'add' ? props.triggerClassName : undefined;

  const {
    register,
    control,
    setError,
    reset,
    formState: { isValid, isSubmitting, errors },
    handleSubmit,
  } = useForm<ArtworkFormUi>({
    mode: 'onChange',
    defaultValues: work
      ? {
          artist_email: work.artist_email || null,
          title: work.title,
          artist_name: work.artist_name,
          description: work.description,
          image_url: work.image_url,
        }
      : {
          artist_email: null,
          title: '',
          artist_name: '',
          description: null,
          image_url: '',
        },
  });

  const submitHandler = async (e: ArtworkFormUi) => {
    const formData = new FormData();
    if (props.mode === 'edit') {
      formData.append('artist_email', e.artist_email ?? '');
    } else if (e.artist_email) {
      formData.append('artist_email', e.artist_email);
    }
    if (props.mode === 'edit') {
      formData.append('description', e.description ?? '');
    } else if (e.description) {
      formData.append('description', e.description);
    }
    formData.append('artist_name', e.artist_name);
    formData.append('title', e.title);
    formData.append('image_url', e.image_url);
    try {
      if (work) {
        await putArtWorkByArtWorkId(id, work.id, formData);
      } else {
        await postArtWorksByExhibitionId(id, formData);
      }
      setOpen(false);
      router.refresh();
    } catch (err) {
      if (err instanceof Error && err.message === 'profile not found') {
        setError('artist_email', {
          type: 'server',
          message: '가입된 프로필이 없습니다',
        });
      }
    }
  };

  useEffect(() => {
    if (open && work) {
      reset({
        artist_email: work.artist_email || null,
        title: work.title,
        artist_name: work.artist_name,
        description: work.description,
        image_url: work.image_url,
      });
    } else if (!open) {
      reset();
    }
  }, [open, work, reset]);

  const trigger = (
    <DialogTrigger
      render={
        work ? (
          <Button
            size="sm"
            variant="surface"
            className="hover:text-primary flex-1 rounded-lg"
          />
        ) : (
          <Button
            className={cn(
              'hover:bg-primary/80 rounded-xl',
              addTriggerClassName
            )}
          />
        )
      }
    >
      {work ? (
        <>
          <Pencil className="h-3.5 w-3.5" />
          수정
        </>
      ) : (
        <>
          <Plus className="h-4 w-4" />
          {addTriggerLabel}
        </>
      )}
    </DialogTrigger>
  );

  return (
    <AppDialog
      open={open}
      onOpenChange={setOpen}
      trigger={trigger}
      title={work ? '작품 수정' : '작품 등록'}
      className="sm:max-w-lg"
    >
      <form onSubmit={handleSubmit(submitHandler)}>
        <div className="space-y-5 py-1">
          <Controller
            name="image_url"
            control={control}
            rules={{ required: true }}
            render={({ field }) => (
              <WorkFormBox label="작품 이미지" essential>
                <ImageUploadBox value={field.value} onChange={field.onChange} />
              </WorkFormBox>
            )}
          />

          <WorkFormBox label="작품명" essential>
            <input
              {...register('title', { required: true })}
              type="text"
              placeholder="작품 제목을 입력하세요"
              className={fieldClass}
            />
          </WorkFormBox>

          <WorkFormBox label="작가명" essential>
            <input
              {...register('artist_name', { required: true })}
              type="text"
              placeholder="학생 이름"
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
              {...register('artist_email', { required: false })}
              type="email"
              placeholder="스타아트 가입 이메일 (있는 경우)"
              className={fieldClass}
            />
            {errors.artist_email && (
              <p className="text-xs text-red-500">
                {errors.artist_email.message}
              </p>
            )}
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
            type="submit"
            disabled={!isValid || isSubmitting}
            className="flex-1 rounded-xl py-6"
          >
            {work ? '수정하기' : isSubmitting ? '등록중' : '등록하기'}
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
    </AppDialog>
  );
}
