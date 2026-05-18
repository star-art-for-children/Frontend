export default function Loading() {
  return (
    <div className={'flex w-full flex-col items-center px-[20px] py-[40px]'}>
      <div className={'flex w-full max-w-[576px] flex-col gap-[32px]'}>
        <div className="flex items-center justify-between">
          <div className="flex flex-col gap-1">
            <div className="h-7 w-48 animate-pulse rounded-md bg-gray-200"></div>
            <div className="h-3 w-32 animate-pulse rounded-md bg-gray-200"></div>
          </div>
          <div className="h-10 w-10 animate-pulse rounded-[14px] bg-gray-200"></div>
        </div>
        <form>
          <div className="flex w-full flex-col gap-6 rounded-[24px] border bg-white p-[33px] shadow-sm">
            <div className="flex flex-col gap-2">
              <div className="flex w-fit gap-2">
                <div className="h-5 w-24 animate-pulse rounded-md bg-gray-200"></div>
              </div>
              <div className="border-secondary/8 text-secondary/60 rounded-[14px] border px-4 py-5">
                <div className="h-5 w-full animate-pulse rounded-md bg-gray-200"></div>
              </div>
            </div>
            <div className="flex flex-col gap-2">
              <div className="flex w-fit gap-2">
                <div className="h-5 w-24 animate-pulse rounded-md bg-gray-200"></div>
              </div>
              <div className="border-secondary/8 text-secondary/60 rounded-[14px] border px-4 py-5">
                <div className="h-3 w-full animate-pulse rounded-md bg-gray-200"></div>
              </div>
            </div>
            <div className="flex flex-col gap-2">
              <div className="flex w-fit gap-2">
                <div className="h-5 w-20 animate-pulse rounded-md bg-gray-200"></div>
              </div>
              <div className="border-secondary/8 text-secondary/60 rounded-[14px] border px-4 py-5">
                <div className="h-3 w-full animate-pulse rounded-md bg-gray-200"></div>
              </div>
            </div>
            <div className="flex flex-col gap-2">
              <div className="flex w-fit gap-2">
                <div className="h-5 w-24 animate-pulse rounded-md bg-gray-200"></div>
              </div>
              <div className="border-secondary/8 text-secondary/60 overflow-hidden rounded-[14px] border border-0! p-0! px-4 py-5">
                <div className="border-secondary/8 flex cursor-pointer flex-col items-center justify-center gap-2 rounded-xl border-2 border-dashed py-12 transition-colors">
                  <div className="h-8 w-8 animate-pulse rounded-full bg-gray-200"></div>
                  <div className="h-3 w-32 animate-pulse rounded-md bg-gray-200"></div>
                  <div className="h-3 w-24 animate-pulse rounded-md bg-gray-200"></div>
                </div>
              </div>
            </div>
            <div className="-mt-5 h-3 w-32 animate-pulse rounded-md bg-gray-200"></div>
            <div className="flex w-full flex-wrap gap-4">
              <div className="flex-1">
                <div className="flex flex-col gap-2">
                  <div className="flex w-fit gap-2">
                    <div className="h-5 w-16 animate-pulse rounded-md bg-gray-200"></div>
                  </div>
                  <div className="border-secondary/8 text-secondary/60 rounded-[14px] border px-4 py-5">
                    <div className="h-5 w-full animate-pulse rounded-md bg-gray-200"></div>
                  </div>
                </div>
              </div>
              <div className="flex-1">
                <div className="flex flex-col gap-2">
                  <div className="flex w-fit gap-2">
                    <div className="h-5 w-16 animate-pulse rounded-md bg-gray-200"></div>
                  </div>
                  <div className="border-secondary/8 text-secondary/60 rounded-[14px] border px-4 py-5">
                    <div className="h-5 w-full animate-pulse rounded-md bg-gray-200"></div>
                  </div>
                </div>
              </div>
            </div>
            <div className="flex h-14 gap-3">
              <div className="flex-1 animate-pulse rounded-[16px] bg-gray-200"></div>
              <div className="animate-pulse rounded-[14px] bg-gray-200 px-6"></div>
            </div>
          </div>
        </form>
      </div>
    </div>
  );
}
