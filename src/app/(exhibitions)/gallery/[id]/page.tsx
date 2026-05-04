'use client';
import { useParams } from 'next/navigation';
import { useEffect, useState } from 'react';
import { IoIosArrowBack } from 'react-icons/io';
import { VscMute } from 'react-icons/vsc';
import { AiOutlineSound } from 'react-icons/ai';
import ModalWrapper from '@/components/galleryExhibition/threejs/ModalWrapper';
import Scene from '@/components/galleryExhibition/threejs/Scene';
import Scene2 from '@/components/galleryExhibition/threejs/test/Scene';

export default function GalleryExhibitionPage() {
  const { id } = useParams();
  const [galleryInit, setGalleryInit] = useState([]);
  const [isMuted, setIsMuted] = useState(false);
  const [start, setStart] = useState(0);
  console.log(start);
  useEffect(() => {
    console.log(id);
    const fetchInit = async () => {
      //서비스 레이어로 뺼예정
      try {
        const res = await fetch('/');
        if (!res.ok) {
          throw new Error('Failed to fetch');
        }
        const result = await res.json();

        setGalleryInit(result.data);
      } catch (error) {
        console.log(error);
      }
    };
  }, []);
  if (start === 0) {
    return (
      <ModalWrapper
        isOpen={!start}
        height={492}
        width={448}
        className={'bg-black!'}
      >
        <div
          className={
            'flex h-full flex-col items-center justify-center gap-5 p-8'
          }
        >
          <div
            className={
              'bg-primary/50 flex h-16 w-16 items-center justify-center rounded-3xl text-3xl'
            }
          >
            🎨
          </div>
          <p className={'text-secondary text-[20px] font-bold'}>봄의 소리전</p>
          <p className={'text-secondary/40 -mt-5 text-[14px]'}>
            해피아트 미술학원
          </p>
          <div
            className={
              'bg-primary/10 flex w-full flex-col gap-1 rounded-lg p-4'
            }
          >
            <p className={'text-secondary/40 text-[14px]'}>
              🖱️ 화면 클릭으로 마우스 조작 시작
            </p>
            <p className={'text-secondary/40 text-[14px]'}>
              ⌨️ WASD 또는 방향키로 이동
            </p>
            <p className={'text-secondary/40 text-[14px]'}>
              👁️ 마우스로 시선 이동
            </p>
            <p className={'text-secondary/40 text-[14px]'}>
              🖼️ 작품에 가까이 가면 정보 팝업
            </p>
            <p className={'text-secondary/40 text-[14px]'}>
              ESC로 마우스 조작 해제
            </p>
          </div>
          <div className={'flex w-full justify-between gap-3'}>
            <button
              className={
                'bg-primary/90 hover:bg-primary flex-1 cursor-pointer rounded-xl py-[14px] text-center text-[16px] font-bold text-white'
              }
              onClick={() => setStart(1)}
            >
              typeA
            </button>
            <button
              className={
                'bg-secondary/5 text-secondary/70 flex-1 cursor-pointer rounded-xl py-[14px] text-center text-[16px]'
              }
              onClick={() => setStart(2)}
            >
              typeB
            </button>
          </div>
        </div>
      </ModalWrapper>
    );
  }
  return (
    <div className={'scr fixed inset-0 z-50'}>
      <div
        className={'absolute z-40 flex w-full items-start justify-between p-5'}
      >
        <div
          className={
            'flex items-center gap-2 rounded-2xl bg-black/50 p-3 backdrop-blur-lg'
          }
        >
          <IoIosArrowBack className={'text-lg text-white/80'} />
          <div className={'flex flex-col'}>
            <p className={'font-bold text-white/80'}>봄의 소리전</p>
            <p className={'text-sm text-white/30'}>해피아트 미술학원</p>
          </div>
        </div>
        <div
          onClick={(e) => {
            e.stopPropagation();
            setIsMuted((s) => !s);
          }}
          className={
            'flex items-center gap-2 rounded-lg bg-black/50 p-3 backdrop-blur-lg'
          }
        >
          {isMuted ? (
            <VscMute className={'text-xl text-white/80'} />
          ) : (
            <AiOutlineSound className={'text-xl text-white/80'} />
          )}
        </div>
      </div>
      {start === 1 ? <Scene /> : <Scene2 />}
    </div>
  );
}
