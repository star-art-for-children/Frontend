'use client';

import { Upload, X } from 'lucide-react';
import Image from 'next/image';
import { useMemo, useRef } from 'react';

interface ImageUploadBoxProps {
  value?: File | string | null;
  onChange?: (file: File | null) => void;
}

export default function ImageUploadBox({
  value,
  onChange,
}: ImageUploadBoxProps) {
  const inputRef = useRef<HTMLInputElement>(null);

  const preview = useMemo(() => {
    if (!value) return null;

    if (typeof value === 'string') {
      return value;
    }

    return URL.createObjectURL(value);
  }, [value]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    onChange?.(file);
  };

  const removeImage = () => {
    onChange?.(null);
    if (inputRef.current) inputRef.current.value = '';
  };

  const handleDrop = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    const file = e.dataTransfer.files?.[0];

    if (!file || !file.type.startsWith('image/')) return;

    onChange?.(file);
  };

  return (
    <>
      <input
        ref={inputRef}
        type="file"
        accept="image/jpeg,image/png,image/gif"
        className="hidden"
        onChange={handleChange}
      />

      {preview ? (
        <div className="relative aspect-4/3 w-full overflow-hidden rounded-xl bg-[#F5EFE0]">
          <Image
            src={preview}
            alt="작품 미리보기"
            fill
            sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 25vw"
            className="object-cover"
          />

          <button
            type="button"
            onClick={removeImage}
            className="absolute top-2 right-2 flex h-7 w-7 items-center justify-center rounded-full bg-black/50 text-white transition-colors hover:bg-black/70"
          >
            <X className="h-4 w-4" />
          </button>
        </div>
      ) : (
        <div
          onClick={() => inputRef.current?.click()}
          onDragOver={(e) => e.preventDefault()}
          onDrop={handleDrop}
          className="flex cursor-pointer flex-col items-center justify-center gap-2 rounded-xl border-2 border-dashed border-gray-200 bg-gray-50 py-12 transition-colors hover:bg-gray-100"
        >
          <Upload className="text-secondary/40 h-8 w-8" />

          <p className="text-secondary/60 text-sm">
            이미지를 드래그하거나 클릭하여 업로드
          </p>

          <p className="text-secondary/40 text-xs">JPG, PNG, GIF 지원</p>
        </div>
      )}
    </>
  );
}
