import { ReactNode } from 'react';
export default function CreateGalleryFormWrapper({
  title,
  icon,
  required = false,
  className,
  children,
}: {
  title: string;
  icon: ReactNode;
  required?: boolean;
  className?: string;
  children: React.ReactNode;
}) {
  return (
    <div className={'flex flex-col gap-2'}>
      <p className={'flex w-fit gap-2 font-medium'}>
        {icon}
        {title}
        {required && <span className={'text-[14px] text-red-500'}>*</span>}
      </p>
      <div
        className={`border-secondary/8 text-secondary/60 bg-primary/5 rounded-[14px] border px-4 py-5 text-[18px] ${className}`}
      >
        {children}
      </div>
    </div>
  );
}
