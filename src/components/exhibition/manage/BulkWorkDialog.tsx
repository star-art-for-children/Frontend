'use client';

import { useCallback, useEffect, useMemo } from 'react';
import { useFieldArray, useForm, useWatch } from 'react-hook-form';
import { useParams, useRouter } from 'next/navigation';
import { useRef, useState } from 'react';
import Image from 'next/image';
import { Layers, Loader2, Plus, Upload, X } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { DialogClose, DialogTrigger } from '@/components/ui/dialog';
import AppDialog from '@/components/shared/AppDialog';
import { postArtWorksByExhibitionId } from '@/lib/artwork/service';

type BulkRow = { image: File; title: string; artist_name: string };
type BulkForm = { rows: BulkRow[] };

const fieldClass =
  'w-full rounded-lg border border-gray-200 bg-surface px-3 py-2 text-sm outline-none focus:border-[#F5A623] focus:bg-white';

function RowItem({
  index,
  imageFile,
  onRemove,
  register,
}: {
  index: number;
  imageFile: File | undefined;
  onRemove: () => void;
  register: ReturnType<typeof useForm<BulkForm>>['register'];
}) {
  const preview = useMemo(
    () => (imageFile ? URL.createObjectURL(imageFile) : ''),
    [imageFile]
  );

  useEffect(() => {
    return () => {
      if (preview) URL.revokeObjectURL(preview);
    };
  }, [preview]);

  return (
    <div className="flex items-center gap-3 rounded-xl border border-gray-100 bg-white p-3 shadow-[0_1px_4px_rgba(44,40,38,0.06)]">
      <div className="relative h-16 w-16 flex-shrink-0 overflow-hidden rounded-lg bg-[#F5EFE0]">
        {preview && (
          <Image
            src={preview}
            alt=""
            fill
            sizes="64px"
            className="object-cover"
          />
        )}
      </div>

      <div className="flex flex-1 flex-col gap-2">
        <input
          {...register(`rows.${index}.title`, { required: true })}
          placeholder="작품명"
          className={fieldClass}
        />
        <input
          {...register(`rows.${index}.artist_name`, { required: true })}
          placeholder="작가명"
          className={fieldClass}
        />
      </div>

      <button
        type="button"
        onClick={onRemove}
        className="flex-shrink-0 rounded-full p-1 text-gray-400 transition-colors hover:text-gray-600"
      >
        <X className="h-4 w-4" />
      </button>
    </div>
  );
}

export default function BulkWorkDialog() {
  const { id } = useParams<{ id: string }>();
  const router = useRouter();
  const [open, setOpen] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [result, setResult] = useState<{
    success: number;
    fail: number;
  } | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const abortControllerRef = useRef<AbortController | null>(null);

  const {
    register,
    control,
    reset,
    handleSubmit,
    formState: { isValid },
  } = useForm<BulkForm>({
    mode: 'onChange',
    defaultValues: { rows: [] },
  });

  const { fields, append, remove } = useFieldArray({ control, name: 'rows' });
  const rowValues = useWatch({ control, name: 'rows' });

  const handleFiles = (files: FileList | null) => {
    if (!files) return;
    Array.from(files).forEach((file) => {
      if (file.type.startsWith('image/')) {
        append({ image: file, title: '', artist_name: '' });
      }
    });
    if (fileInputRef.current) fileInputRef.current.value = '';
  };

  const handleRemove = (index: number) => remove(index);

  const handleClose = useCallback(() => {
    // 진행 중인 업로드가 있으면 모두 취소
    abortControllerRef.current?.abort();
    abortControllerRef.current = null;
    setUploading(false);
    reset();
    setResult(null);
  }, [reset]);

  const submitHandler = useCallback(
    async (data: BulkForm) => {
      // 업로드가 이미 진행 중이면 재진입 차단 (이전 배치 취소 핸들 보호)
      if (abortControllerRef.current) return;
      const controller = new AbortController();
      abortControllerRef.current = controller;
      setUploading(true);

      const results = await Promise.allSettled(
        data.rows.map((row) => {
          const formData = new FormData();
          formData.append('image_url', row.image);
          formData.append('title', row.title);
          formData.append('artist_name', row.artist_name);
          return postArtWorksByExhibitionId(id, formData, controller.signal);
        })
      );

      // 업로드 도중 다이얼로그를 닫아 취소된 경우, 후속 처리를 건너뛴다
      if (controller.signal.aborted) return;

      abortControllerRef.current = null;
      setUploading(false);

      const success = results.filter((r) => r.status === 'fulfilled').length;
      const fail = results.filter((r) => r.status === 'rejected').length;

      if (fail === 0) {
        handleClose();
        setOpen(false);
        router.refresh();
      } else {
        const failedRows = data.rows.filter(
          (_, i) => results[i].status === 'rejected'
        );
        reset({ rows: failedRows });
        setResult({ success, fail });
      }
    },
    [id, handleClose, reset, router]
  );

  const onSubmit = useCallback(
    (e: React.FormEvent<HTMLFormElement>) => handleSubmit(submitHandler)(e),
    [handleSubmit, submitHandler]
  );

  const handleOpenChange = useCallback(
    (v: boolean) => {
      if (!v) handleClose();
      setOpen(v);
    },
    [handleClose]
  );

  const trigger = (
    <DialogTrigger
      render={
        <Button variant="white" className="rounded-xl px-4 py-5 font-bold" />
      }
    >
      <Layers className="h-4 w-4" />
      여러 개 등록하기
    </DialogTrigger>
  );

  return (
    <AppDialog
      open={open}
      onOpenChange={handleOpenChange}
      trigger={trigger}
      title="작품 여러 개 등록하기"
      className="max-w-2xl"
    >
      <input
        ref={fileInputRef}
        type="file"
        accept="image/jpeg,image/png,image/gif,image/webp"
        multiple
        className="hidden"
        onChange={(e) => handleFiles(e.target.files)}
      />

      {fields.length === 0 ? (
        <div
          onClick={() => fileInputRef.current?.click()}
          onDragOver={(e) => e.preventDefault()}
          onDrop={(e) => {
            e.preventDefault();
            handleFiles(e.dataTransfer.files);
          }}
          className="flex cursor-pointer flex-col items-center justify-center gap-2 rounded-xl border-2 border-dashed border-gray-200 bg-gray-50 py-16 transition-colors hover:bg-gray-100"
        >
          <Upload className="text-secondary/40 h-8 w-8" />
          <p className="text-secondary/60 text-sm">
            이미지를 드래그하거나 클릭하여 여러 장 선택
          </p>
          <p className="text-secondary/40 text-xs">JPG, PNG, GIF, WebP 지원</p>
        </div>
      ) : (
        <form onSubmit={onSubmit}>
          <div className="space-y-2">
            {fields.map((field, index) => (
              <RowItem
                key={field.id}
                index={index}
                imageFile={rowValues[index]?.image}
                onRemove={() => handleRemove(index)}
                register={register}
              />
            ))}
          </div>

          <button
            type="button"
            onClick={() => fileInputRef.current?.click()}
            className="text-secondary/60 hover:text-secondary mt-3 w-full rounded-xl border border-dashed border-gray-200 py-3 text-sm transition-colors hover:bg-gray-50"
          >
            <Plus className="mr-1 inline h-3.5 w-3.5" />
            이미지 추가
          </button>

          {result && (
            <p className="mt-2 text-sm text-red-500">
              {result.success}개 성공, {result.fail}개 실패. 실패한 항목을
              확인해주세요.
            </p>
          )}

          <div className="mt-4 flex gap-2">
            <Button
              type="submit"
              disabled={!isValid || uploading}
              className="flex-1 rounded-xl py-6"
            >
              {uploading ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  등록중...
                </>
              ) : (
                `${fields.length}개 등록하기`
              )}
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
      )}
    </AppDialog>
  );
}
