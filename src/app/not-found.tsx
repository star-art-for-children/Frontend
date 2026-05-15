import { Palette } from 'lucide-react';
import Link from 'next/link';

export const NotFound = () => {
  return (
    <>
      <div className="flex h-screen w-full items-center justify-center bg-[#faf7f2]">
        <div className="flex flex-col items-center">
          {/* 팔레트 아이콘 */}
          <div className="flex h-24 w-24 items-center justify-center rounded-[24px] bg-linear-to-br from-[#F4B942] to-[#FF7B6B]">
            <Palette size={48} color="white" strokeWidth={3} />
          </div>
          {/* 하단 텍스트 */}
          <h1 className="text-primary mt-6 text-[80px] leading-20 font-extrabold">
            404
          </h1>
          <h3 className="mt-1.5 text-2xl leading-9 font-semibold">
            페이지를 찾을 수 없어요
          </h3>
          <p className="mt-3.25 text-[14px] leading-5 font-normal text-[rgba(44,40,38,0.50)]">
            요청하신 페이지가 존재하지 않거나 이동되었습니다.
          </p>
          <Link
            href={'/'}
            className="bg-primary mt-7.5 rounded-[16px] pt-3.25 pr-[20.75px] pb-3.75 pl-5 shadow-md hover:opacity-70"
          >
            <span className="text-[16px] leading-6 font-semibold text-white">
              메인으로 돌아가기
            </span>
          </Link>
        </div>
      </div>
    </>
  );
};
export default NotFound;
