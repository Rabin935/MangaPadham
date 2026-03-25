import Link from "next/link";

export default function Home() {
  const highlights = [
    "Secure JWT auth with protected API routes",
    "Password reset flow with expiring recovery tokens",
    "Reusable Mongoose models and cached database connection",
  ];

  return (
    <main className="relative isolate min-h-screen overflow-hidden px-4 py-8 sm:px-6 lg:px-8">
      <div className="pointer-events-none absolute inset-0">
        <div className="absolute left-[-8%] top-8 h-72 w-72 rounded-full bg-cyan-400/20 blur-3xl" />
        <div className="absolute bottom-0 right-[-10%] h-80 w-80 rounded-full bg-amber-400/10 blur-3xl" />
      </div>

      <div className="relative mx-auto flex min-h-[calc(100vh-4rem)] w-full max-w-6xl flex-col justify-between rounded-[32px] border border-white/10 bg-[rgba(7,13,28,0.72)] px-6 py-8 shadow-[0_40px_140px_rgba(0,0,0,0.55)] backdrop-blur-xl sm:px-10 sm:py-10">
        <header className="flex flex-col gap-6 border-b border-white/10 pb-8 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <p className="text-xs uppercase tracking-[0.45em] text-cyan-300/80">
              Manga Padham
            </p>
            <h1 className="mt-3 max-w-2xl text-4xl font-semibold tracking-tight text-white sm:text-5xl">
              A cinematic authentication starter for your manga platform.
            </h1>
          </div>

          <div className="flex flex-wrap gap-3">
            <Link
              href="/login"
              className="rounded-full border border-white/15 px-5 py-2.5 text-sm font-medium text-slate-200 transition hover:border-cyan-300/40 hover:bg-white/5"
            >
              Login
            </Link>
            <Link
              href="/signup"
              className="rounded-full bg-cyan-300 px-5 py-2.5 text-sm font-semibold text-slate-950 transition hover:bg-cyan-200"
            >
              Create account
            </Link>
          </div>
        </header>

        <section className="grid gap-10 py-12 lg:grid-cols-[1.25fr_0.75fr] lg:items-end">
          <div>
            <p className="max-w-xl text-lg leading-8 text-slate-300">
              Login, signup, forgot-password, JWT auth, and reset-password APIs
              are wired up and ready. The auth pages lean into an inky dark
              atmosphere with bright cyan and amber accents so the experience
              feels more like a story portal than a plain form screen.
            </p>

            <div className="mt-8 flex flex-wrap gap-3">
              <Link
                href="/signup"
                className="rounded-full bg-white px-6 py-3 text-sm font-semibold text-slate-950 transition hover:bg-slate-100"
              >
                Start with signup
              </Link>
              <Link
                href="/forgot-password"
                className="rounded-full border border-white/15 px-6 py-3 text-sm font-medium text-slate-200 transition hover:border-amber-300/40 hover:bg-white/5"
              >
                Try recovery flow
              </Link>
            </div>
          </div>

          <div className="grid gap-4">
            {highlights.map((highlight, index) => (
              <div
                key={highlight}
                className="rounded-[24px] border border-white/10 bg-white/5 p-5 backdrop-blur transition hover:-translate-y-0.5 hover:border-cyan-300/30 hover:bg-white/8"
              >
                <p className="text-xs uppercase tracking-[0.35em] text-slate-500">
                  0{index + 1}
                </p>
                <p className="mt-3 text-base font-medium leading-7 text-slate-100">
                  {highlight}
                </p>
              </div>
            ))}
          </div>
        </section>
      </div>
    </main>
  );
}
