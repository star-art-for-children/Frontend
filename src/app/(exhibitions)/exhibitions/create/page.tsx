'use client';
import { Controller, useForm } from 'react-hook-form';
import ImageUpload from '@/components/galleryCreate/ImageUpload';
import CreateGalleryFormWrapper from '@/components/galleryCreate/FormWrapper';
import { FaArrowRight } from 'react-icons/fa';
import {
  Palette,
  ImagePlus,
  Calendar,
  FileText,
  X,
  ShieldAlert,
} from 'lucide-react';
import { postNewExhibition } from '@/service/exhibitions';
import { useRouter } from 'next/navigation';
import { UIFormProps } from '@/types/gallery';
export default function GalleryCreatePage() {
  const {
    register,
    watch,
    control,
    formState: { isValid, errors, isSubmitting },
    handleSubmit,
  } = useForm<UIFormProps>({
    mode: 'onChange',
    defaultValues: {
      galleryName: '',
      galleryDesc: '',
      galleryImg: null,
      guideLines: null,
      startDate: '',
      endDate: null,
    },
  });
  const router = useRouter();

  const submitHandler = async (e: UIFormProps) => {
    const formData = new FormData();

    formData.append('galleryName', e.galleryName);
    formData.append('galleryDesc', e.galleryDesc);

    if (e.galleryImg) {
      formData.append('galleryImg', e.galleryImg);
    }

    if (e.guideLines) {
      formData.append('guideLines', e.guideLines);
    }

    formData.append('startDate', e.startDate);

    if (e.endDate) {
      formData.append('endDate', e.endDate);
    }

    try {
      const exhibitionId = await postNewExhibition(formData); // 전시관 생성 후 id 리턴 -> id 로 전시관 상세(전시 작품) 넣으면 될 듯
      router.push(`/exhibitions/${exhibitionId}/manage`);
      console.log(exhibitionId);
    } catch (err) {
      console.log(err);
    }
  };
  return (
    <>
      <div className={'flex w-full flex-col items-center px-[20px] py-[40px]'}>
        <div className={'flex w-full max-w-[576px] flex-col gap-[32px]'}>
          <div className={'flex items-center justify-between'}>
            <div className={'flex flex-col gap-1'}>
              <p className={'text-secondary] text-[28px] font-bold'}>
                새 전시회 만들기
              </p>
              <p className={'text-secondary/50 text-[14px]'}>
                해피아트 미술학원
              </p>
            </div>
            <div
              className={
                'border-secondary/8 text-secondary/50 flex h-10 w-10 cursor-pointer rounded-[14px] border bg-white duration-200 hover:font-bold hover:text-black'
              }
            >
              <X className={'m-auto'} />
            </div>
          </div>
          <form onSubmit={handleSubmit(submitHandler)}>
            <div
              className={
                'border-secondary/5 flex w-full flex-col gap-6 rounded-[24px] border bg-white p-[33px] shadow-sm'
              }
            >
              <CreateGalleryFormWrapper
                title={'전시회 이름'}
                icon={<Palette className={'text-primary w-[17px]'} />}
                required
              >
                <input
                  {...register('galleryName', { required: true })}
                  className={'w-full bg-transparent outline-none'}
                  placeholder={'예: 봄의 소리전, 상상화전...'}
                />
              </CreateGalleryFormWrapper>
              {/*<ShieldAlert />*/}
              <CreateGalleryFormWrapper
                title={'전시회 설명'}
                icon={<FileText className={'text-primary w-[17px]'} />}
                required
              >
                <textarea
                  rows={5}
                  {...register('galleryDesc', { required: true })}
                  placeholder={'전시회에 대한 소개를 작성해주세요...'}
                  className={
                    'w-full resize-none bg-transparent text-[16px] outline-none'
                  }
                />
              </CreateGalleryFormWrapper>

              <CreateGalleryFormWrapper
                title={'가이드라인'}
                icon={<ShieldAlert className={'text-primary w-[17px]'} />}
              >
                <textarea
                  rows={2}
                  {...register('guideLines')}
                  placeholder={'전시회에 대한 가이드라인을 작성해주세요.'}
                  className={
                    'w-full resize-none bg-transparent text-[16px] outline-none'
                  }
                />
              </CreateGalleryFormWrapper>
              <Controller
                name="galleryImg"
                control={control}
                render={({ field }) => (
                  <>
                    <CreateGalleryFormWrapper
                      className={'overflow-hidden border-2 border-dashed p-0!'}
                      title={'배경 이미지'}
                      icon={<ImagePlus className={'text-primary w-[17px]'} />}
                    >
                      <ImageUpload
                        value={field.value}
                        onChange={field.onChange}
                      />
                    </CreateGalleryFormWrapper>
                    <p className="-mt-5 text-[12px] text-[#2C28264D]">
                      전시회 상세 페이지 및 리스트에 표시되는 대표 이미지입니다
                    </p>
                  </>
                )}
              />
              <div className={'flex w-full flex-wrap gap-4'}>
                <div className={'flex-1'}>
                  <CreateGalleryFormWrapper
                    title={'시작일'}
                    className={'py-3!'}
                    required
                    icon={<Calendar className={'text-primary w-[17px]'} />}
                  >
                    <input
                      {...register('startDate', { required: true })}
                      className={
                        'w-full bg-transparent text-[16px] font-bold text-black outline-none'
                      }
                      type={'date'}
                    />
                  </CreateGalleryFormWrapper>
                </div>
                <div className={'flex-1'}>
                  <CreateGalleryFormWrapper
                    title={'종료일'}
                    className={'py-3!'}
                    icon={<Calendar className={'text-secondary w-[17px]'} />}
                  >
                    <input
                      {...register('endDate', {
                        validate: (value) => {
                          const start = watch('startDate');
                          if (!value) return true;
                          return value >= start || false;
                        },
                      })}
                      className={
                        'w-full bg-transparent text-[16px] font-bold text-black outline-none'
                      }
                      type={'date'}
                    />
                  </CreateGalleryFormWrapper>
                  {errors.endDate && (
                    <p className={'text-sm text-red-500'}>
                      *종료일은 시작일 이후여야 합니다.
                    </p>
                  )}
                </div>
              </div>
              <div className={'flex h-14 gap-3'}>
                <button
                  type="submit"
                  disabled={!isValid || isSubmitting}
                  className={`bg-primary flex-1 rounded-[16px] text-[16px] font-bold text-white disabled:opacity-40`}
                >
                  {isSubmitting ? (
                    <p>전시관 생성중</p>
                  ) : (
                    <p>
                      다음 : 작품 등록하기
                      <FaArrowRight className={'m-auto inline text-sm'} />
                    </p>
                  )}
                </button>
                <button
                  className={
                    'border-secondary/8 text-secondary/60 rounded-[14px] border bg-[#FAF7F2] px-6 text-[16px]'
                  }
                >
                  취소
                </button>
              </div>
            </div>
          </form>
        </div>
      </div>
    </>
  );
}
