import { cookies } from "next/headers";
import Link from "next/link";
import { TrendingMangaSection } from "@/components/home/trending-manga-section";
import { getTrendingManga } from "@/lib/mangadex";
import type { Manga } from "@/types/mangadex";

export default async function Home() {
  const cookieStore = await cookies();
  const hasSession = Boolean(cookieStore.get("token"));
  let trendingManga: Manga[] = [];

  try {
    trendingManga = await getTrendingManga(10);
  } catch {
    trendingManga = [];
  }

  return (
    <main className="relative isolate min-h-screen overflow-hidden px-4 py-8 sm:px-6 lg:px-8">
      <div className="pointer-events-none absolute inset-0">
        <div className="absolute left-[-12%] top-0 h-96 w-96 rounded-full bg-cyan-400/18 blur-3xl" />
        <div className="absolute right-[-8%] top-28 h-80 w-80 rounded-full bg-amber-400/12 blur-3xl" />
        <div className="absolute bottom-[-14%] left-1/3 h-96 w-96 rounded-full bg-sky-500/10 blur-3xl" />
      </div>

      <div className="relative mx-auto w-full max-w-7xl">
        <section className="overflow-hidden rounded-[34px] border border-white/10 bg-[rgba(7,13,28,0.74)] px-6 py-10 shadow-[0_40px_140px_rgba(0,0,0,0.45)] backdrop-blur-xl sm:px-10 sm:py-14">
          <div className="grid gap-10 lg:grid-cols-[1.08fr_0.92fr] lg:items-center">
            <div>
              <p className="text-xs uppercase tracking-[0.45em] text-cyan-300/80">
                Manga Padham
              </p>
              <h1 className="mt-5 max-w-4xl text-5xl font-semibold tracking-tight text-white sm:text-6xl">
                Follow the titles everyone is rushing to read next.
              </h1>
              <p className="mt-6 max-w-2xl text-base leading-8 text-slate-300">
                Browse trending manga, unlock fresh chapters early, and keep your
                reading streak moving in one place built for long nights and
                cliffhanger marathons.
              </p>

              <div className="mt-8 flex flex-wrap gap-3">
                <Link
                  href="/manga"
                  className="rounded-full bg-cyan-300 px-6 py-3 text-sm font-semibold text-slate-950 transition hover:bg-cyan-200"
                >
                  Browse manga
                </Link>
                <Link
                  href={hasSession ? "/dashboard" : "/signup"}
                  className="rounded-full border border-white/15 px-6 py-3 text-sm font-medium text-slate-200 transition hover:border-amber-300/35 hover:bg-white/5"
                >
                  {hasSession ? "Open dashboard" : "Create your account"}
                </Link>
              </div>
            </div>

            <div className="grid gap-4 sm:grid-cols-3 lg:grid-cols-1">
              <div className="rounded-[26px] border border-white/10 bg-white/5 p-5">
                <p className="text-xs uppercase tracking-[0.35em] text-slate-500">
                  Trending Picks
                </p>
                <p className="mt-3 text-sm leading-7 text-slate-200">
                  Start with the most-followed manga rising to the top of the
                  current wave.
                </p>
              </div>
              <div className="rounded-[26px] border border-white/10 bg-white/5 p-5">
                <p className="text-xs uppercase tracking-[0.35em] text-slate-500">
                  Unlock Early
                </p>
                <p className="mt-3 text-sm leading-7 text-slate-200">
                  Spend coins to jump into the newest locked chapters before they
                  become free.
                </p>
              </div>
              <div className="rounded-[26px] border border-white/10 bg-white/5 p-5">
                <p className="text-xs uppercase tracking-[0.35em] text-slate-500">
                  Keep Reading
                </p>
                <p className="mt-3 text-sm leading-7 text-slate-200">
                  Pick up where you left off with saved progress and your
                  favorite series close by.
                </p>
              </div>
            </div>
          </div>
        </section>

        <TrendingMangaSection mangaList={trendingManga} />
      </div>
    </main>
  );
}
