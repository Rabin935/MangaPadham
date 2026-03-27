export default function Loading() {
  return (
    <main className="relative isolate min-h-screen overflow-hidden px-4 py-8 sm:px-6 lg:px-8">
      <div className="pointer-events-none absolute inset-0">
        <div className="absolute left-[-8%] top-10 h-72 w-72 rounded-full bg-cyan-400/18 blur-3xl" />
        <div className="absolute bottom-[-10%] right-[-10%] h-80 w-80 rounded-full bg-amber-400/10 blur-3xl" />
      </div>

      <div className="relative mx-auto w-full max-w-6xl rounded-[32px] border border-white/10 bg-[rgba(7,13,28,0.74)] px-6 py-8 shadow-[0_40px_140px_rgba(0,0,0,0.45)] backdrop-blur-xl sm:px-10 sm:py-10">
        <div className="h-10 w-32 animate-pulse rounded-full bg-white/10" />

        <section className="mt-8 grid gap-8 lg:grid-cols-[0.42fr_0.58fr] lg:items-start">
          <div className="aspect-[4/5] animate-pulse rounded-[28px] border border-white/10 bg-white/8" />

          <div>
            <div className="h-3 w-32 animate-pulse rounded-full bg-white/10" />
            <div className="mt-4 h-12 w-full max-w-xl animate-pulse rounded-full bg-white/10" />
            <div className="mt-6 h-12 w-36 animate-pulse rounded-full bg-white/10" />

            <div className="mt-8 rounded-[24px] border border-white/10 bg-white/5 p-6">
              <div className="h-3 w-24 animate-pulse rounded-full bg-white/10" />
              <div className="mt-4 h-4 w-full animate-pulse rounded-full bg-white/10" />
              <div className="mt-3 h-4 w-11/12 animate-pulse rounded-full bg-white/10" />
              <div className="mt-3 h-4 w-10/12 animate-pulse rounded-full bg-white/10" />
            </div>

            <div className="mt-6 grid gap-6 md:grid-cols-2">
              {[0, 1].map((card) => (
                <div
                  key={card}
                  className="rounded-[24px] border border-white/10 bg-white/5 p-6"
                >
                  <div className="h-3 w-24 animate-pulse rounded-full bg-white/10" />
                  <div className="mt-4 flex flex-wrap gap-2">
                    {[0, 1, 2].map((pill) => (
                      <div
                        key={pill}
                        className="h-8 w-24 animate-pulse rounded-full bg-white/10"
                      />
                    ))}
                  </div>
                </div>
              ))}
            </div>
          </div>
        </section>

        <section className="mt-8 rounded-[28px] border border-white/10 bg-white/5 p-6">
          <div className="h-3 w-28 animate-pulse rounded-full bg-white/10" />
          <div className="mt-4 h-8 w-48 animate-pulse rounded-full bg-white/10" />
          <div className="mt-6 grid gap-3">
            {[0, 1, 2, 3].map((chapter) => (
              <div
                key={chapter}
                className="rounded-[22px] border border-white/10 bg-[rgba(8,14,32,0.78)] px-5 py-4"
              >
                <div className="h-4 w-28 animate-pulse rounded-full bg-white/10" />
                <div className="mt-3 h-4 w-2/3 animate-pulse rounded-full bg-white/10" />
              </div>
            ))}
          </div>
        </section>
      </div>
    </main>
  );
}
