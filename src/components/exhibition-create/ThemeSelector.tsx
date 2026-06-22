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
    <div className="flex flex-col gap-2.5">
      <div className="flex flex-wrap items-center gap-2.5">
        {/* AI 자동 생성 스와치 */}
        <button
          type="button"
          onClick={() => onChange(value === 'ai' ? null : 'ai')}
          aria-label="AI 자동 생성"
          title="AI 자동 생성"
          className={`inline-flex h-9 items-center justify-center gap-1.5 rounded-full transition-all duration-200 ${
            !hasThumb
              ? 'w-9 cursor-not-allowed bg-linear-to-br from-violet-400 to-indigo-500 opacity-30'
              : value === 'ai'
                ? 'bg-indigo-50 pr-3.5 pl-1.5 text-sm font-semibold text-indigo-600 ring-2 ring-indigo-500'
                : 'w-9 bg-linear-to-br from-violet-400 to-indigo-500 hover:scale-110'
          }`}
          disabled={!hasThumb}
        >
          {value === 'ai' ? (
            <>
              <span className="flex h-6 w-6 items-center justify-center rounded-full bg-linear-to-br from-violet-400 to-indigo-500">
                <Wand2 className="h-3.5 w-3.5 text-white" />
              </span>
              AI 자동
            </>
          ) : (
            <Wand2 className="h-4 w-4 text-white" />
          )}
        </button>

        {ALL_PRESETS.map((preset) => {
          const isSelected = value === preset.id;
          const label = PRESET_LABELS[preset.id] ?? preset.id;
          return (
            <button
              key={preset.id}
              type="button"
              onClick={() => onChange(isSelected ? null : preset.id)}
              aria-label={label}
              title={label}
              className={`inline-flex h-9 items-center gap-1.5 rounded-full transition-all duration-200 ${
                isSelected
                  ? 'bg-primary/10 text-primary ring-primary pr-3.5 pl-1.5 text-sm font-semibold ring-2'
                  : 'w-9 ring-1 ring-black/10 hover:scale-110'
              }`}
              style={isSelected ? undefined : { background: getCardBg(preset) }}
            >
              {isSelected && (
                <span
                  className="h-6 w-6 rounded-full ring-1 ring-black/10"
                  style={{ background: getCardBg(preset) }}
                />
              )}
              {isSelected && label}
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
