export default function Loading() {
  return (
    <main className="flex min-h-screen items-center justify-center px-4 py-8 sm:px-6 lg:px-8">
      <div className="w-full max-w-md rounded-[28px] border border-white/10 bg-[rgba(7,13,28,0.82)] p-8 text-center shadow-[0_30px_100px_rgba(0,0,0,0.45)] backdrop-blur-xl">
        <div className="mx-auto h-12 w-12 animate-pulse rounded-full bg-cyan-300/20" />
        <p className="mt-5 text-sm leading-7 text-slate-300">
          Redirecting to the reader...
        </p>
      </div>
    </main>
  );
}
