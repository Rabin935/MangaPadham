import Image from "next/image";
import Link from "next/link";
import { getCoverImageUrl, getGenreLabels, getMangaTitle } from "@/lib/manga-display";
import type { Manga } from "@/types/mangadex";

type TrendingMangaSectionProps = {
  mangaList: Manga[];
};

export function TrendingMangaSection({
  mangaList,
}: TrendingMangaSectionProps) {
  if (mangaList.length === 0) {
    return (
      <section className="mt-10 rounded-[30px] border border-white/10 bg-[rgba(8,14,32,0.76)] p-6 shadow-[0_24px_90px_rgba(0,0,0,0.28)] backdrop-blur-xl">
        <p className="text-xs uppercase tracking-[0.35em] text-cyan-300/80">
          Trending Now
        </p>
        <p className="mt-4 text-sm leading-7 text-slate-300">
          Trending manga is unavailable right now. Browse the full library to
          discover fresh series.
        </p>
      </section>
    );
  }

  return (
    <section className="mt-10 rounded-[30px] border border-white/10 bg-[rgba(8,14,32,0.76)] p-6 shadow-[0_24px_90px_rgba(0,0,0,0.28)] backdrop-blur-xl sm:p-8">
      <div className="flex flex-col gap-4 border-b border-white/10 pb-6 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <p className="text-xs uppercase tracking-[0.35em] text-cyan-300/80">
            Trending Now
          </p>
          <h2 className="mt-3 text-3xl font-semibold tracking-tight text-white sm:text-4xl">
            Popular manga readers are circling back to.
          </h2>
        </div>
        <div className="max-w-sm text-sm leading-7 text-slate-300">
          Scroll sideways to explore this week&apos;s most-followed manga on
          MangaDex.
        </div>
      </div>

      <div className="relative mt-8">
        <div className="pointer-events-none absolute inset-y-0 left-0 z-10 w-10 bg-gradient-to-r from-[rgba(8,14,32,0.92)] to-transparent" />
        <div className="pointer-events-none absolute inset-y-0 right-0 z-10 w-10 bg-gradient-to-l from-[rgba(8,14,32,0.92)] to-transparent" />

        <div className="flex snap-x snap-mandatory gap-5 overflow-x-auto pb-4 pr-4 [scrollbar-width:thin]">
          {mangaList.map((manga, index) => {
            const coverImageUrl = getCoverImageUrl(manga, "512");
            const title = getMangaTitle(manga);
            const genreLabel =
              getGenreLabels(manga).slice(0, 2).join(" / ") || "Unknown genre";

            return (
              <Link
                key={manga.id}
                href={`/manga/${manga.id}`}
                className="group relative block w-[260px] shrink-0 snap-start overflow-hidden rounded-[28px] border border-white/10 bg-[rgba(7,13,28,0.82)] shadow-[0_20px_70px_rgba(0,0,0,0.3)] transition duration-300 hover:-translate-y-1 hover:border-cyan-300/35"
              >
                <div className="relative aspect-[4/5] overflow-hidden bg-[linear-gradient(180deg,rgba(34,211,238,0.24),rgba(8,14,32,0.96))]">
                  {coverImageUrl ? (
                    <Image
                      src={coverImageUrl}
                      alt={title}
                      fill
                      sizes="260px"
                      className="object-cover transition duration-500 group-hover:scale-[1.04]"
                    />
                  ) : (
                    <div className="flex h-full items-center justify-center px-6 text-center text-sm font-medium uppercase tracking-[0.35em] text-slate-200/70">
                      No Cover
                    </div>
                  )}

                  <div className="pointer-events-none absolute inset-x-0 bottom-0 h-36 bg-gradient-to-t from-[rgba(2,6,23,0.98)] via-[rgba(2,6,23,0.7)] to-transparent" />
                  <div className="absolute left-4 top-4 rounded-full border border-amber-300/20 bg-amber-300/12 px-3 py-1 text-xs font-semibold uppercase tracking-[0.28em] text-amber-100">
                    #{String(index + 1).padStart(2, "0")}
                  </div>
                </div>

                <div className="space-y-3 p-5">
                  <p className="text-xs uppercase tracking-[0.35em] text-slate-500">
                    {genreLabel}
                  </p>
                  <h3 className="line-clamp-2 text-xl font-semibold leading-8 text-white">
                    {title}
                  </h3>
                  <p className="text-sm text-cyan-200 transition group-hover:text-cyan-100">
                    Open details
                  </p>
                </div>
              </Link>
            );
          })}
        </div>
      </div>
    </section>
  );
}
