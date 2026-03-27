import Image from "next/image";
import Link from "next/link";
import { notFound } from "next/navigation";
import { getChapterById, getChapterPages, getMangaById, MangaDexRequestError } from "@/lib/mangadex";
import type { Chapter, Manga } from "@/types/mangadex";
import {
  getChapterNumberLabel,
  getChapterTitle,
} from "@/lib/chapter-display";
import { getMangaTitle } from "@/lib/manga-display";

type MangaReaderPageProps = {
  params: Promise<{
    id: string;
    chapterId: string;
  }>;
};

function ErrorState({ message }: { message: string }) {
  return (
    <div className="rounded-[28px] border border-rose-300/20 bg-rose-400/8 p-6 text-center">
      <p className="text-xs uppercase tracking-[0.35em] text-rose-200/70">
        Reader Error
      </p>
      <p className="mt-4 text-base leading-7 text-slate-200">{message}</p>
    </div>
  );
}

export default async function MangaReaderPage({
  params,
}: MangaReaderPageProps) {
  const { id, chapterId } = await params;
  let manga: Manga | null = null;
  let chapter: Chapter | null = null;
  let pageErrorMessage: string | null = null;
  let pageImages: string[] = [];

  try {
    [manga, chapter] = await Promise.all([
      getMangaById(id),
      getChapterById(chapterId),
    ]);
  } catch (error) {
    if (error instanceof MangaDexRequestError && error.status === 404) {
      notFound();
    }

    const message =
      error instanceof Error
        ? error.message
        : "Unable to load the reader right now.";

    return (
      <main className="relative isolate min-h-screen overflow-hidden px-4 py-8 sm:px-6 lg:px-8">
        <div className="relative mx-auto flex min-h-[calc(100vh-4rem)] w-full max-w-4xl items-center">
          <ErrorState message={message} />
        </div>
      </main>
    );
  }

  if (!manga || !chapter) {
    return (
      <main className="relative isolate min-h-screen overflow-hidden px-4 py-8 sm:px-6 lg:px-8">
        <div className="relative mx-auto flex min-h-[calc(100vh-4rem)] w-full max-w-4xl items-center">
          <ErrorState message="Unable to load the reader right now." />
        </div>
      </main>
    );
  }

  try {
    pageImages = await getChapterPages(chapterId);
  } catch (error) {
    pageErrorMessage =
      error instanceof Error
        ? error.message
        : "Unable to load chapter pages right now.";
  }

  const mangaTitle = getMangaTitle(manga);
  const chapterLabel = getChapterNumberLabel(chapter);
  const chapterTitle = getChapterTitle(chapter);

  return (
    <main className="relative isolate min-h-screen overflow-hidden px-4 py-8 sm:px-6 lg:px-8">
      <div className="pointer-events-none absolute inset-0">
        <div className="absolute left-[-8%] top-10 h-72 w-72 rounded-full bg-cyan-400/18 blur-3xl" />
        <div className="absolute bottom-[-10%] right-[-10%] h-80 w-80 rounded-full bg-amber-400/10 blur-3xl" />
      </div>

      <div className="relative mx-auto w-full max-w-5xl rounded-[32px] border border-white/10 bg-[rgba(7,13,28,0.74)] px-6 py-8 shadow-[0_40px_140px_rgba(0,0,0,0.45)] backdrop-blur-xl sm:px-10 sm:py-10">
        <div className="flex flex-col gap-4 border-b border-white/10 pb-6 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <p className="text-xs uppercase tracking-[0.45em] text-cyan-300/80">
              Reader
            </p>
            <h1 className="mt-3 text-3xl font-semibold tracking-tight text-white sm:text-4xl">
              {mangaTitle}
            </h1>
            <p className="mt-3 text-sm leading-7 text-slate-300">
              {chapterLabel}: {chapterTitle}
            </p>
          </div>

          <Link
            href={`/manga/${id}`}
            className="inline-flex rounded-full border border-white/15 px-5 py-2.5 text-sm font-medium text-slate-200 transition hover:border-cyan-300/40 hover:bg-white/5"
          >
            Back to details
          </Link>
        </div>

        {pageErrorMessage ? (
          <div className="mt-8">
            <ErrorState message={pageErrorMessage} />
          </div>
        ) : (
          <section className="mt-8 space-y-6">
            {pageImages.map((pageImage, index) => (
              <div
                key={pageImage}
                className="overflow-hidden rounded-[24px] border border-white/10 bg-[rgba(8,14,32,0.78)]"
              >
                <Image
                  src={pageImage}
                  alt={`${chapterTitle} page ${index + 1}`}
                  width={1200}
                  height={1800}
                  className="h-auto w-full object-contain"
                />
              </div>
            ))}
          </section>
        )}
      </div>
    </main>
  );
}
