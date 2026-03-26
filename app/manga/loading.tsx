const loadingCards = Array.from({ length: 8 }, (_, index) => index);

export default function Loading() {
  return (
    <main className="relative isolate min-h-screen overflow-hidden px-4 py-8 sm:px-6 lg:px-8">
      <div className="pointer-events-none absolute inset-0">
        <div className="absolute left-[-8%] top-12 h-72 w-72 rounded-full bg-cyan-400/18 blur-3xl" />
        <div className="absolute bottom-[-8%] right-[-10%] h-80 w-80 rounded-full bg-amber-400/10 blur-3xl" />
      </div>

      <div className="relative mx-auto w-full max-w-7xl rounded-[32px] border border-white/10 bg-[rgba(7,13,28,0.72)] px-6 py-8 shadow-[0_40px_140px_rgba(0,0,0,0.45)] backdrop-blur-xl sm:px-10 sm:py-10">
        <div className="animate-pulse border-b border-white/10 pb-8">
          <div className="h-3 w-32 rounded-full bg-white/10" />
          <div className="mt-4 h-12 max-w-xl rounded-full bg-white/10" />
          <div className="mt-4 h-4 max-w-2xl rounded-full bg-white/10" />
        </div>

        <section className="mt-10 grid gap-6 sm:grid-cols-2 xl:grid-cols-4">
          {loadingCards.map((card) => (
            <div
              key={card}
              className="overflow-hidden rounded-[28px] border border-white/10 bg-[rgba(7,13,28,0.78)]"
            >
              <div className="aspect-[4/5] animate-pulse bg-white/8" />
              <div className="space-y-3 p-5">
                <div className="h-3 w-20 animate-pulse rounded-full bg-white/10" />
                <div className="h-6 w-full animate-pulse rounded-full bg-white/10" />
                <div className="h-4 w-32 animate-pulse rounded-full bg-white/10" />
              </div>
            </div>
          ))}
        </section>
      </div>
    </main>
  );
}
