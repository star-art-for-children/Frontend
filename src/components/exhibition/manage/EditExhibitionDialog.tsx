'use client';

import { Pencil } from 'lucide-react';
import { useEffect, useState } from 'react';
import { useForm } from 'react-hook-form';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { DialogClose, DialogTrigger } from '@/components/ui/dialog';
import AppDialog from '@/components/shared/AppDialog';
import WorkFormBox from './WorkFormBox';
import {
  EditExhibitionSchema,
  type EditExhibitionInput,
} from '@/lib/schemas/exhibition';
import { updateExhibition } from '@/lib/exhibition/service';
import type { ExhibitionStatus } from '@/lib/exhibition/dateStatus';

const fieldClass =
  'text-secondary placeholder:text-secondary/40 w-full rounded-xl border border-gray-200 bg-surface px-4 py-3 text-sm outline-none focus:border-[#F5A623] focus:bg-white disabled:cursor-not-allowed disabled:opacity-60';

interface EditExhibitionDialogProps {
  exhibitionId: string;
  title: string;
  description: string;
  startDate: string;
  endDate: string | null;
  status: ExhibitionStatus;
}

export default function EditExhibitionDialog({
  exhibitionId,
  title,
  description,
  startDate,
  endDate,
  status,
}: EditExhibitionDialogProps) {
  const [open, setOpen] = useState(false);
  const router = useRouter();

  // 상태별 편집 제약: 진행중이면 시작일 잠금, 종료면 전부 읽기전용.
  const startLocked = status !== 'upcoming';
  const readOnlyAll = status === 'ended';

  const defaults: EditExhibitionInput = {
    title,
    description,
    startDateRaw: startDate,
    endDateRaw: endDate,
  };

  const {
    register,
    handleSubmit,
    reset,
    setError,
    formState: { isSubmitting, errors },
  } = useForm<EditExhibitionInput>({
    mode: 'onChange',
    defaultValues: defaults,
  });

  useEffect(() => {
    if (open) reset(defaults);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [open]);

  const submitHandler = async (values: EditExhibitionInput) => {
    const normalized = {
      ...values,
      endDateRaw: values.endDateRaw ? values.endDateRaw : null,
    };
    const parsed = EditExhibitionSchema.safeParse(normalized);
    if (!parsed.success) {
      setError('endDateRaw', {
        type: 'validate',
        message: '입력값을 확인해주세요 (종료일은 시작일 이후여야 합니다)',
      });
      return;
    }
    try {
      await updateExhibition(exhibitionId, parsed.data);
      setOpen(false);
      router.refresh();
    } catch (err) {
      setError('title', {
        type: 'server',
        message: err instanceof Error ? err.message : '수정에 실패했습니다',
      });
    }
  };

  const trigger = (
    <DialogTrigger
      render={
        <Button variant="surface" size="lg" className="shrink-0 rounded-xl" />
      }
    >
      <Pencil className="h-4 w-4" />
      수정
    </DialogTrigger>
  );

  return (
    <AppDialog
      open={open}
      onOpenChange={setOpen}
      trigger={trigger}
      title="전시회 수정"
    >
      <form onSubmit={handleSubmit(submitHandler)}>
        <div className="space-y-5 py-1">
          <WorkFormBox label="전시 제목" essential>
            <input
              {...register('title', { required: true })}
              type="text"
              placeholder="전시 제목을 입력하세요"
              className={fieldClass}
              disabled={readOnlyAll}
            />
            {errors.title && (
              <p className="text-xs text-red-500">{errors.title.message}</p>
            )}
          </WorkFormBox>

          <WorkFormBox label="전시 설명">
            <textarea
              {...register('description')}
              placeholder="전시 설명을 입력하세요"
              rows={4}
              className={fieldClass}
              disabled={readOnlyAll}
            />
          </WorkFormBox>

          <WorkFormBox label="시작일" essential>
            <input
              {...register('startDateRaw', { required: true })}
              type="date"
              className={fieldClass}
              disabled={startLocked}
            />
            {startLocked && !readOnlyAll && (
              <p className="text-secondary/50 text-xs">
                이미 시작된 전시는 시작일을 변경할 수 없습니다
              </p>
            )}
          </WorkFormBox>

          <WorkFormBox label="종료일">
            <input
              {...register('endDateRaw')}
              type="date"
              className={fieldClass}
              disabled={readOnlyAll}
            />
            {errors.endDateRaw && (
              <p className="text-xs text-red-500">
                {errors.endDateRaw.message}
              </p>
            )}
          </WorkFormBox>

          <div className="flex justify-end gap-2 pt-2">
            <DialogClose
              render={
                <Button type="button" variant="surface" className="rounded-xl" />
              }
            >
              취소
            </DialogClose>
            <Button
              type="submit"
              className="rounded-xl"
              disabled={readOnlyAll || isSubmitting}
            >
              저장
            </Button>
          </div>
        </div>
      </form>
    </AppDialog>
  );
}
