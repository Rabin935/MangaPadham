import Image from "next/image";
import Link from "next/link";
import { notFound } from "next/navigation";
import { FavoriteToggleButton } from "@/components/manga/favorite-toggle-button";
import { getChapters, getMangaById, MangaDexRequestError } from "@/lib/mangadex";
import type { Chapter, Manga } from "@/types/mangadex";
import {
  getChapterNumberLabel,
  getChapterTitle,
  getReaderPageHref,
  sortChaptersLatestFirst,
} from "@/lib/chapter-display";
import {
  getCoverImageUrl,
  getGenreLabels,
  getMangaDescription,
  getMangaTitle,
  getTagLabels,
} from "@/lib/manga-display";

type MangaDetailPageProps = {
  params: Promise<{
    id: string;
  }>;
};

function ErrorState({ message }: { message: string }) {
  return (
    <div className="rounded-[28px] border border-rose-300/20 bg-rose-400/8 p-6 text-center">
      <p className="text-xs uppercase tracking-[0.35em] text-rose-200/70">
        MangaDex Error
      </p>
      <p className="mt-4 text-base leading-7 text-slate-200">{message}</p>
    </div>
  );
}

export default async function MangaDetailPage({
  params,
}: MangaDetailPageProps) {
  const { id } = await params;
  let manga: Manga | null = null;
  let chapters: Chapter[] = [];
  let errorMessage: string | null = null;
  let chapterErrorMessage: string | null = null;

  try {
    manga = await getMangaById(id);
  } catch (error) {
    if (error instanceof MangaDexRequestError && error.status === 404) {
      notFound();
    }

    errorMessage =
      error instanceof Error
        ? error.message
        : "Unable to load manga details right now.";
  }

  if (!manga) {
    return (
      <main className="relative isolate min-h-screen overflow-hidden px-4 py-8 sm:px-6 lg:px-8">
        <div className="relative mx-auto flex min-h-[calc(100vh-4rem)] w-full max-w-4xl items-center">
          <ErrorState
            message={errorMessage ?? "Unable to load manga details right now."}
          />
        </div>
      </main>
    );
  }

  try {
    chapters = sortChaptersLatestFirst(await getChapters(id));
  } catch (error) {
    chapterErrorMessage =
      error instanceof Error
        ? error.message
        : "Unable to load chapters right now.";
  }

  const title = getMangaTitle(manga);
  const description = getMangaDescription(manga);
  const coverImageUrl = getCoverImageUrl(manga, "512");
  const genres = getGenreLabels(manga);
  const tags = getTagLabels(manga);
  const latestChapter = chapters[0] ?? null;

  return (
    <main className="relative isolate min-h-screen overflow-hidden px-4 py-8 sm:px-6 lg:px-8">
      <div className="pointer-events-none absolute inset-0">
        <div className="absolute left-[-8%] top-10 h-72 w-72 rounded-full bg-cyan-400/18 blur-3xl" />
        <div className="absolute bottom-[-10%] right-[-10%] h-80 w-80 rounded-full bg-amber-400/10 blur-3xl" />
      </div>

      <div className="relative mx-auto w-full max-w-6xl rounded-[32px] border border-white/10 bg-[rgba(7,13,28,0.74)] px-6 py-8 shadow-[0_40px_140px_rgba(0,0,0,0.45)] backdrop-blur-xl sm:px-10 sm:py-10">
        <Link
          href="/manga"
          className="inline-flex rounded-full border border-white/15 px-4 py-2 text-sm font-medium text-slate-200 transition hover:border-cyan-300/40 hover:bg-white/5"
        >
          Back to manga
        </Link>

        <section className="mt-8 grid gap-8 lg:grid-cols-[0.42fr_0.58fr] lg:items-start">
          <div className="overflow-hidden rounded-[28px] border border-white/10 bg-[rgba(8,14,32,0.78)]">
            <div className="relative aspect-[4/5] bg-[linear-gradient(180deg,rgba(34,211,238,0.18),rgba(8,14,32,0.95))]">
              {coverImageUrl ? (
                <Image
                  src={coverImageUrl}
                  alt={title}
                  fill
                  sizes="(min-width: 1024px) 40vw, 100vw"
                  className="object-cover"
                />
              ) : (
                <div className="flex h-full items-center justify-center px-6 text-center text-sm font-medium uppercase tracking-[0.35em] text-slate-200/70">
                  No Cover
                </div>
              )}
            </div>
          </div>

          <div>
            <p className="text-xs uppercase tracking-[0.45em] text-cyan-300/80">
              Manga Details
            </p>
            <h1 className="mt-3 text-4xl font-semibold tracking-tight text-white sm:text-5xl">
              {title}
            </h1>

            <div className="mt-6 flex flex-wrap gap-3">
              {latestChapter ? (
                <Link
                  href={getReaderPageHref(latestChapter.id)}
                  className="rounded-full bg-cyan-300 px-6 py-3 text-sm font-semibold text-slate-950 transition hover:bg-cyan-200"
                >
                  Read Now
                </Link>
              ) : (
                <a
                  href={`https://mangadex.org/title/${manga.id}`}
                  target="_blank"
                  rel="noreferrer"
                  className="rounded-full border border-white/15 px-6 py-3 text-sm font-medium text-slate-200 transition hover:border-cyan-300/40 hover:bg-white/5"
                >
                  View on MangaDex
                </a>
              )}

              <FavoriteToggleButton mangaId={manga.id} />
            </div>

            <div className="mt-8 rounded-[24px] border border-white/10 bg-white/5 p-6">
              <p className="text-xs uppercase tracking-[0.35em] text-slate-500">
                Description
              </p>
              <p className="mt-4 whitespace-pre-line text-base leading-8 text-slate-200">
                {description}
              </p>
            </div>

            <div className="mt-6 grid gap-6 md:grid-cols-2">
              <div className="rounded-[24px] border border-white/10 bg-white/5 p-6">
                <p className="text-xs uppercase tracking-[0.35em] text-amber-300/80">
                  Genres
                </p>
                <div className="mt-4 flex flex-wrap gap-2">
                  {(genres.length > 0 ? genres : ["Unknown genre"]).map((genre) => (
                    <span
                      key={genre}
                      className="rounded-full border border-amber-300/20 bg-amber-300/10 px-3 py-1.5 text-sm font-medium text-amber-100"
                    >
                      {genre}
                    </span>
                  ))}
                </div>
              </div>

              <div className="rounded-[24px] border border-white/10 bg-white/5 p-6">
                <p className="text-xs uppercase tracking-[0.35em] text-cyan-300/80">
                  Tags
                </p>
                <div className="mt-4 flex flex-wrap gap-2">
                  {tags.map((tag) => (
                    <span
                      key={tag}
                      className="rounded-full border border-white/10 bg-[rgba(8,14,32,0.78)] px-3 py-1.5 text-sm font-medium text-slate-200"
                    >
                      {tag}
                    </span>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </section>

        <section className="mt-8 rounded-[28px] border border-white/10 bg-white/5 p-6">
          <div className="flex flex-col gap-3 border-b border-white/10 pb-5 sm:flex-row sm:items-end sm:justify-between">
            <div>
              <p className="text-xs uppercase tracking-[0.35em] text-cyan-300/80">
                Chapters
              </p>
              <h2 className="mt-3 text-2xl font-semibold text-white">
                Latest chapters
              </h2>
            </div>
            <p className="text-sm text-slate-400">
              Sorted with the newest releases first.
            </p>
          </div>

          {chapterErrorMessage ? (
            <div className="mt-6">
              <ErrorState message={chapterErrorMessage} />
            </div>
          ) : chapters.length > 0 ? (
            <div className="mt-6 grid gap-3">
              {chapters.map((chapter) => (
                <Link
                  key={chapter.id}
                  href={getReaderPageHref(chapter.id)}
                  className="flex flex-col gap-3 rounded-[22px] border border-white/10 bg-[rgba(8,14,32,0.78)] px-5 py-4 transition hover:border-cyan-300/35 hover:bg-[rgba(10,18,38,0.9)] sm:flex-row sm:items-center sm:justify-between"
                >
                  <div>
                    <p className="text-sm font-semibold text-cyan-200">
                      {getChapterNumberLabel(chapter)}
                    </p>
                    <p className="mt-1 text-sm leading-6 text-slate-300">
                      {getChapterTitle(chapter)}
                    </p>
                  </div>
                  <span className="text-sm font-medium text-amber-200">
                    Open reader
                  </span>
                </Link>
              ))}
            </div>
          ) : (
            <p className="mt-6 text-sm leading-7 text-slate-300">
              No chapters are available for this manga yet.
            </p>
          )}
        </section>
      </div>
    </main>
  );
}
