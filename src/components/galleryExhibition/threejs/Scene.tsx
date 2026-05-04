import { Canvas } from '@react-three/fiber';
import { PointerLockControls } from '@react-three/drei';
import Room from '@/components/galleryExhibition/threejs/Room';
import React, { useState } from 'react';
import Image from 'next/image';
import ModalWrapper from '@/components/galleryExhibition/threejs/ModalWrapper';
import Player from '@/components/galleryExhibition/threejs/Player';
import { PaintingType } from '../../../types/gallery';
import { INIT } from '../../../../data/galleryData';

export default function Scene() {
  const [isModalOpen, setIsModalOpen] = useState<null | number>(null);
  const details = isModalOpen
    ? (INIT.find((x) => x.id === isModalOpen) ?? null)
    : null;

  return (
    <>
      <Canvas shadows camera={{ fov: 75 }}>
        <ambientLight intensity={1} />

        <directionalLight position={[5, 8, 5]} intensity={0.8} castShadow />

        <directionalLight position={[-5, 5, -5]} intensity={0.2} />

        <Room setIsModalOpen={setIsModalOpen} init={INIT} />

        <Player />

        <PointerLockControls />
      </Canvas>
      <ModalWrapper height={635} width={672} isOpen={!!isModalOpen}>
        <PaintingDetailsModal details={details} />
      </ModalWrapper>
    </>
  );
}
function PaintingDetailsModal({ details }: { details: PaintingType | null }) {
  if (!details) return null;
  return (
    <>
      <div className={'relative m-0 h-[445px] w-full'}>
        <Image
          src={details.paintingUrl}
          fill
          className={'absolute object-cover'}
          alt={'error'}
        />
      </div>

      <div className={'flex flex-col gap-3 p-6'}>
        <p className={'text-[20px] font-bold'}>{details.title}</p>
        <p className={'text-secondary text-[14px] opacity-50'}>
          작가: {details.author}
        </p>
        <p className={'text-secondary text-[14px] opacity-60'}>
          {details.desc}
        </p>
        <div className={'flex items-center justify-between'}>
          <div className={'flex gap-2'}>
            <div
              className={'bg-primary h-[30px] w-[30px] rounded-full opacity-10'}
            ></div>
            <div
              className={'bg-primary h-[30px] w-[30px] rounded-full opacity-10'}
            >
              <div
                className={'z-50 m-auto h-[16px] w-[15px] bg-black opacity-0!'}
              ></div>
            </div>
            <div
              className={'bg-primary h-[30px] w-[30px] rounded-full opacity-10'}
            ></div>
          </div>
          <p className={'text-secondary text-[12px] opacity-30'}>
            로그인 후 좋아요/저장 가능
          </p>
        </div>
      </div>
    </>
  );
}
