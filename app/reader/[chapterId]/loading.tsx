export default function Loading() {
  return (
    <main className="relative isolate min-h-screen overflow-hidden px-4 py-6 sm:px-6 lg:px-8">
      <div className="pointer-events-none absolute inset-0">
        <div className="absolute left-[-8%] top-10 h-72 w-72 rounded-full bg-cyan-400/16 blur-3xl" />
        <div className="absolute bottom-[-10%] right-[-10%] h-80 w-80 rounded-full bg-amber-400/10 blur-3xl" />
      </div>

      <div className="relative mx-auto w-full max-w-5xl">
        <div className="rounded-[28px] border border-white/10 bg-[rgba(7,13,28,0.82)] px-5 py-4 shadow-[0_20px_80px_rgba(0,0,0,0.35)] backdrop-blur-xl">
          <div className="h-3 w-20 animate-pulse rounded-full bg-white/10" />
          <div className="mt-4 h-10 w-full max-w-xs animate-pulse rounded-full bg-white/10" />
          <div className="mt-3 h-4 w-full max-w-md animate-pulse rounded-full bg-white/10" />
          <div className="mt-5 flex gap-3">
            {[0, 1, 2].map((button) => (
              <div
                key={button}
                className="h-10 w-28 animate-pulse rounded-full bg-white/10"
              />
            ))}
          </div>
        </div>

        <section className="mt-8 space-y-5">
          {[0, 1, 2].map((page) => (
            <div
              key={page}
              className="aspect-[3/4] animate-pulse rounded-[24px] border border-white/10 bg-white/8"
            />
          ))}
        </section>
      </div>
    </main>
  );
}
