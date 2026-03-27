export default function Loading() {
  return (
    <main className="relative isolate min-h-screen overflow-hidden px-4 py-8 sm:px-6 lg:px-8">
      <div className="pointer-events-none absolute inset-0">
        <div className="absolute left-[-8%] top-10 h-72 w-72 rounded-full bg-cyan-400/18 blur-3xl" />
        <div className="absolute bottom-[-10%] right-[-10%] h-80 w-80 rounded-full bg-amber-400/10 blur-3xl" />
      </div>

      <div className="relative mx-auto w-full max-w-5xl rounded-[32px] border border-white/10 bg-[rgba(7,13,28,0.74)] px-6 py-8 shadow-[0_40px_140px_rgba(0,0,0,0.45)] backdrop-blur-xl sm:px-10 sm:py-10">
        <div className="border-b border-white/10 pb-6">
          <div className="h-3 w-24 animate-pulse rounded-full bg-white/10" />
          <div className="mt-4 h-10 w-full max-w-sm animate-pulse rounded-full bg-white/10" />
          <div className="mt-4 h-4 w-full max-w-xs animate-pulse rounded-full bg-white/10" />
        </div>

        <section className="mt-8 space-y-6">
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
