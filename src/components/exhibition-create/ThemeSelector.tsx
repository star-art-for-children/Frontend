'use client';
import { GalleryPreset } from '@/types/gallery-theme';
import { ALL_PRESETS, PRESET_LABELS } from '@/lib/gallery/presets';
import { Wand2 } from 'lucide-react';

function getCardBg(preset: GalleryPreset): string {
  const { atmosphere } = preset;
  if (atmosphere.type === 'night') return atmosphere.bgColor;
  if (atmosphere.type === 'gradient')
    return `linear-gradient(to bottom, ${atmosphere.topColor}, ${atmosphere.bottomColor})`;
  return preset.wallColor;
}

export default function ThemeSelector({
  value,
  onChange,
  hasThumb,
}: {
  value: string | null;
  onChange: (id: string | null) => void;
  hasThumb: boolean;
}) {
  return (
    <div className="flex flex-col gap-3">
      <div className="grid grid-cols-5 gap-2">
        {/* AI 자동 생성 카드 */}
        <button
          type="button"
          onClick={() => onChange(value === 'ai' ? null : 'ai')}
          className={`flex flex-col overflow-hidden rounded-[10px] border-2 transition-all duration-150 ${
            !hasThumb
              ? 'cursor-not-allowed opacity-40'
              : value === 'ai'
                ? 'border-primary shadow-md'
                : 'border-transparent hover:border-gray-200'
          }`}
          disabled={!hasThumb}
        >
          <div className="flex h-11 w-full items-center justify-center bg-gradient-to-br from-violet-400 to-indigo-500">
            <Wand2 className="h-5 w-5 text-white" />
          </div>
          <div className="w-full bg-indigo-50 px-1 py-[5px] text-center text-[10px] leading-tight font-semibold text-indigo-600">
            AI 자동
          </div>
        </button>

        {ALL_PRESETS.map((preset) => {
          const isSelected = value === preset.id;
          return (
            <button
              key={preset.id}
              type="button"
              onClick={() => onChange(isSelected ? null : preset.id)}
              className={`flex flex-col overflow-hidden rounded-[10px] border-2 transition-all duration-150 ${
                isSelected
                  ? 'border-primary shadow-md'
                  : 'border-transparent hover:border-gray-200'
              }`}
            >
              <div
                className="h-11 w-full"
                style={{ background: getCardBg(preset) }}
              />
              <div
                className="w-full px-1 py-[5px] text-center text-[10px] leading-tight font-semibold text-gray-700"
                style={{ backgroundColor: preset.floor.color || '#fff' }}
              >
                {PRESET_LABELS[preset.id] ?? preset.id}
              </div>
            </button>
          );
        })}
      </div>

      {!value && (
        <p className="text-[11px] text-gray-400">
          테마를 선택하지 않으면 기본 테마로 적용됩니다.
        </p>
      )}
      {value === 'ai' && (
        <p className="flex items-center gap-1 text-[11px] text-indigo-400">
          <Wand2 className="h-3 w-3" />
          배경 이미지를 분석해 테마를 자동 생성합니다.
        </p>
      )}
    </div>
  );
}
