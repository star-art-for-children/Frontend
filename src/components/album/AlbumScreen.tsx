'use client';

import { createElement, useMemo, useState, type ReactElement } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { IoIosArrowBack } from 'react-icons/io';
import { Download, ImageOff, Loader2 } from 'lucide-react';
import type { DocumentProps } from '@react-pdf/renderer';
import type { AlbumArtwork, AlbumMeta } from './AlbumPdfDocument';

interface Props {
  artworks: AlbumArtwork[]; // 오래된 → 최신 순
  meta: AlbumMeta;
}

// 연도별로 묶어 타임라인 섹션 구성
function groupByYear(artworks: AlbumArtwork[]) {
  const map = new Map<string, AlbumArtwork[]>();
  for (const art of artworks) {
    const year = new Date(art.createdAt).getFullYear();
    const key = Number.isNaN(year) ? '기타' : String(year);
    const list = map.get(key);
    if (list) list.push(art);
    else map.set(key, [art]);
  }
  return Array.from(map.entries());
}

function formatDate(iso: string): string {
  const d = new Date(iso);
  if (Number.isNaN(d.getTime())) return '';
  return `${d.getMonth() + 1}월 ${d.getDate()}일`;
}

export default function AlbumScreen({ artworks, meta }: Props) {
  const [generating, setGenerating] = useState(false);
  const groups = useMemo(() => groupByYear(artworks), [artworks]);
  const isEmpty = artworks.length === 0;

  // PDF 생성기·문서를 클릭 시점에만 동적 import → 다른 페이지 번들에 영향 없음
  const handleExport = async () => {
    if (generating || isEmpty) return;
    setGenerating(true);
    try {
      const [{ pdf }, { default: AlbumPdfDocument }] = await Promise.all([
        import('@react-pdf/renderer'),
        import('./AlbumPdfDocument'),
      ]);
      // AlbumPdfDocument는 <Document>를 반환하지만 컴포넌트 props 타입이
      // DocumentProps와 달라 pdf() 시그니처에 맞게 캐스트한다.
      const element = createElement(AlbumPdfDocument, {
        artworks,
        meta,
      }) as ReactElement<DocumentProps>;
      const blob = await pdf(element).toBlob();

      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `${meta.childName}_성장앨범.pdf`;
      document.body.appendChild(a);
      a.click();
      a.remove();
      URL.revokeObjectURL(url);
    } catch (e) {
      console.error('PDF 생성 실패', e);
      alert('PDF를 만드는 중 문제가 생겼어요. 잠시 후 다시 시도해 주세요.');
    } finally {
      setGenerating(false);
    }
  };

  return (
    <main className="min-h-screen bg-[#f8f4ee] text-[#2d2926]">
      <div className="mx-auto w-full max-w-[820px] px-5 py-7">
        {/* 헤더 */}
        <div className="mb-6 flex items-center justify-between gap-3">
          <Link
            href="/my-page"
            className="flex items-center gap-1 text-sm text-[#9b9389] transition-colors hover:text-[#f5bf45]"
          >
            <IoIosArrowBack />
            마이페이지
          </Link>
          <button
            onClick={handleExport}
            disabled={generating || isEmpty}
            className="flex shrink-0 items-center gap-2 rounded-full bg-gradient-to-r from-[#f5bf45] to-[#ff8f74] px-5 py-2.5 text-sm font-semibold text-white shadow-[0_2px_8px_rgba(255,143,116,0.3)] transition-opacity hover:opacity-90 disabled:cursor-not-allowed disabled:opacity-50"
          >
            {generating ? (
              <>
                <Loader2 size={16} className="animate-spin" />
                만드는 중...
              </>
            ) : (
              <>
                <Download size={16} />
                {meta.childName} 스타님의 앨범
              </>
            )}
          </button>
        </div>

        {/* 표지 요약 */}
        <section className="mb-8 rounded-3xl border border-[#e8e1d7] bg-white px-7 py-8 text-center shadow-[0_2px_12px_rgba(64,48,33,0.04)]">
          <p className="mb-2 text-xs tracking-[0.2em] text-[#f09e72]">
            STAR ART ALBUM
          </p>
          <h1 className="text-2xl font-bold">
            <span className="text-[#f09e72]">{meta.childName}</span> 스타님의
            성장 기록
          </h1>
          <div className="mx-auto my-5 h-[3px] w-14 rounded bg-[#f09e72]" />
          <div className="flex items-center justify-center gap-8">
            <div>
              <p className="text-xl font-bold">{meta.artworkCount}</p>
              <p className="mt-0.5 text-xs text-[#9b9389]">작품</p>
            </div>
            <div className="h-8 w-px bg-[#e8e1d7]" />
            <div>
              <p className="text-xl font-bold">
                {meta.periodStart && meta.periodEnd
                  ? formatPeriodLabel(meta.periodStart, meta.periodEnd)
                  : '-'}
              </p>
              <p className="mt-0.5 text-xs text-[#9b9389]">활동 기간</p>
            </div>
          </div>
        </section>

        {/* 타임라인 */}
        {isEmpty ? (
          <div className="flex flex-col items-center gap-3 rounded-3xl border border-dashed border-[#e8e1d7] bg-white/60 px-6 py-16 text-center">
            <ImageOff size={32} className="text-[#c8c1b7]" />
            <p className="text-sm text-[#9b9389]">
              아직 등록된 작품이 없어요.
              <br />
              전시회에 작품이 올라오면 여기에 성장 기록이 쌓여요.
            </p>
          </div>
        ) : (
          <div className="relative pl-6">
            {/* 세로 타임라인 선 */}
            <div className="absolute top-2 bottom-2 left-[7px] w-px bg-[#e8e1d7]" />
            {groups.map(([year, items]) => (
              <div key={year} className="mb-8">
                <div className="relative mb-4">
                  <span className="absolute top-1 -left-6 h-3.5 w-3.5 rounded-full border-2 border-[#f09e72] bg-white" />
                  <h2 className="text-lg font-bold text-[#2d2926]">
                    {year === '기타' ? '기타' : `${year}년`}
                    <span className="ml-2 text-xs font-normal text-[#9b9389]">
                      작품 {items.length}개
                    </span>
                  </h2>
                </div>
                <div className="grid gap-3 sm:grid-cols-2">
                  {items.map((art) => (
                    <div
                      key={art.id}
                      className="flex gap-3 rounded-2xl border border-[#e8e1d7] bg-white p-3 shadow-[0_2px_8px_rgba(64,48,33,0.03)]"
                    >
                      <div className="relative h-20 w-20 shrink-0 overflow-hidden rounded-xl bg-[#f3eee6]">
                        {art.imageUrl ? (
                          <Image
                            src={art.imageUrl}
                            alt={art.title}
                            fill
                            sizes="80px"
                            className="object-cover"
                          />
                        ) : (
                          <div className="flex h-full w-full items-center justify-center">
                            <ImageOff size={18} className="text-[#c8c1b7]" />
                          </div>
                        )}
                      </div>
                      <div className="min-w-0 flex-1">
                        <p className="truncate text-sm font-semibold">
                          {art.title || '제목 없음'}
                        </p>
                        <p className="mt-0.5 truncate text-xs text-[#9b9389]">
                          {art.exhibitionTitle || '전시 정보 없음'}
                        </p>
                        <p className="mt-1.5 text-xs text-[#c8a06f]">
                          {formatDate(art.createdAt)}
                        </p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </main>
  );
}

function formatPeriodLabel(start: string, end: string): string {
  const s = new Date(start);
  const e = new Date(end);
  if (Number.isNaN(s.getTime()) || Number.isNaN(e.getTime())) return '-';
  const fmt = (d: Date) => `${d.getFullYear()}.${d.getMonth() + 1}`;
  const a = fmt(s);
  const b = fmt(e);
  return a === b ? a : `${a}~${b}`;
}
