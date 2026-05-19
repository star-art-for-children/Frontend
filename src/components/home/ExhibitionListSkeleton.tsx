export default function ExhibitionListSkeleton() {
  const cardCount = 8;
  const filterCount = 6;
  return (
    <>
      <section className="space-y-6" aria-busy="true">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div className="flex flex-wrap gap-2">
            {Array.from({ length: filterCount }).map((_, i) => (
              <div
                key={`filter-skeleton:${i + 1}`}
                className="h-9 w-20 animate-pulse rounded-full bg-[#EDE6DA]"
              />
            ))}
          </div>
        </div>

        <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-4">
          {Array.from({ length: cardCount }, (_, index) => (
            <div
              key={index}
              className="overflow-hidden rounded-2xl bg-white shadow-[0_2px_8px_rgba(44,40,38,0.06)]"
            >
              <div className="aspect-4/3 animate-pulse bg-[#EFE4D3]" />
              <div className="space-y-3 p-4">
                <div className="h-5 w-4/5 animate-pulse rounded bg-[#E7D8C4]" />
                <div className="h-4 w-1/2 animate-pulse rounded bg-[#F2E9DC]" />
                <div className="flex items-center justify-between pt-2">
                  <div className="h-3 w-24 animate-pulse rounded bg-[#E7D8C4]" />
                  <div className="h-3 w-10 animate-pulse rounded bg-[#F2E9DC]" />
                </div>
              </div>
            </div>
          ))}
        </div>
      </section>
    </>
  );
}
