import { useRef } from 'react';
import Image from 'next/image';
import { ImagePlus } from 'lucide-react';
export default function ImageUpload({
  value,
  onChange,
}: {
  value: File | null;
  onChange: (file: File) => void;
}) {
  const inputRef = useRef<HTMLInputElement>(null);

  const preview = value ? URL.createObjectURL(value) : null;

  const handleClick = () => {
    inputRef.current?.click();
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    onChange(file);
  };

  return (
    <div className="flex flex-col gap-1">
      <div
        onClick={handleClick}
        className="flex cursor-pointer items-center justify-center overflow-hidden"
      >
        {preview ? (
          <div className="relative h-[300px] w-[520px]">
            <Image src={preview} alt="preview" fill className="object-cover" />
          </div>
        ) : (
          <div className="text-secondary/40 flex flex-col items-center gap-2 py-6">
            <ImagePlus className={'text-secondary/30 h-8 w-8'} />
            <p className="text-[14px]">
              클릭하거나 이미지를 드래그해서 올려주세요.
            </p>
            <p className="text-[12px]">JPG, PNG, WEBP 등 이미지 파일</p>
          </div>
        )}
      </div>

      <input
        ref={inputRef}
        type="file"
        accept="image/*"
        className="hidden"
        onChange={handleChange}
      />
    </div>
  );
}
