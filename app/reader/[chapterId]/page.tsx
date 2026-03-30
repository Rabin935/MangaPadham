import { cookies } from "next/headers";
import Image from "next/image";
import Link from "next/link";
import { notFound } from "next/navigation";
import { ChapterUnlockCard } from "@/components/reader/chapter-unlock-card";
import { ReadingTracker } from "@/components/reader/reading-tracker";
import { getAuthUserFromToken } from "@/lib/auth";
import { getChapterAccessState } from "@/lib/chapter-access";
import {
  getChapterById,
  getChapterPages,
  getChapters,
  MangaDexRequestError,
} from "@/lib/mangadex";
import type { Chapter } from "@/types/mangadex";
import {
  getChapterMangaId,
  getChapterNumberLabel,
  getChapterTitle,
  getReaderPageHref,
  sortChaptersReadingOrder,
} from "@/lib/chapter-display";

type ReaderPageProps = {
  params: Promise<{
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

function formatAccessDateLabel(value: Date) {
  return new Intl.DateTimeFormat("en-US", {
    dateStyle: "medium",
  }).format(value);
}

async function getCurrentUserFromCookies() {
  const cookieStore = await cookies();
  const token = cookieStore.get("token")?.value;

  if (!token) {
    return null;
  }

  try {
    return await getAuthUserFromToken(token);
  } catch {
    return null;
  }
}

function ChapterNavButton({
  chapter,
  label,
}: {
  chapter: Chapter | null;
  label: string;
}) {
  if (!chapter) {
    return (
      <span className="rounded-full border border-white/10 px-4 py-2 text-sm font-medium text-slate-500">
        {label}
      </span>
    );
  }

  return (
    <Link
      href={getReaderPageHref(chapter.id)}
      className="rounded-full border border-white/15 px-4 py-2 text-sm font-medium text-slate-200 transition hover:border-cyan-300/40 hover:bg-white/5"
    >
      {label}
    </Link>
  );
}

export default async function ReaderPage({ params }: ReaderPageProps) {
  const { chapterId } = await params;
  let chapter: Chapter | null = null;
  let readerErrorMessage: string | null = null;
  let pageImages: string[] = [];
  let orderedChapters: Chapter[] = [];
  let mangaId: string | null = null;

  try {
    chapter = await getChapterById(chapterId);
    mangaId = getChapterMangaId(chapter);

    if (!mangaId) {
      notFound();
    }
  } catch (error) {
    if (error instanceof MangaDexRequestError && error.status === 404) {
      notFound();
    }

    readerErrorMessage =
      error instanceof Error
        ? error.message
        : "Unable to load the reader right now.";
  }

  if (!chapter || !mangaId) {
    return (
      <main className="relative isolate min-h-screen overflow-hidden px-4 py-8 sm:px-6 lg:px-8">
        <div className="relative mx-auto flex min-h-[calc(100vh-4rem)] w-full max-w-4xl items-center">
          <ErrorState
            message={readerErrorMessage ?? "Unable to load the reader right now."}
          />
        </div>
      </main>
    );
  }

  const chapterAccessState = getChapterAccessState(chapter);

  if (chapterAccessState.requiresUnlock) {
    const currentUser = await getCurrentUserFromCookies();
    const userAccessState = getChapterAccessState(
      chapter,
      currentUser?.unlockedChapters ?? []
    );

    if (userAccessState.requiresUnlock) {
      return (
        <main className="relative isolate min-h-screen overflow-hidden px-4 py-8 sm:px-6 lg:px-8">
          <div className="pointer-events-none absolute inset-0">
            <div className="absolute left-[-8%] top-10 h-72 w-72 rounded-full bg-cyan-400/16 blur-3xl" />
            <div className="absolute bottom-[-10%] right-[-10%] h-80 w-80 rounded-full bg-amber-400/10 blur-3xl" />
          </div>

          <div className="relative mx-auto flex min-h-[calc(100vh-4rem)] w-full max-w-4xl items-center">
            <ChapterUnlockCard
              chapterId={chapter.id}
              mangaId={mangaId}
              unlockPrice={userAccessState.unlockPrice}
              freeAtLabel={formatAccessDateLabel(userAccessState.freeAt)}
              releaseDelayDays={userAccessState.releaseDelayDays}
            />
          </div>
        </main>
      );
    }
  }

  try {
    const [chapters, pages] = await Promise.all([
      getChapters(mangaId),
      getChapterPages(chapterId),
    ]);

    orderedChapters = sortChaptersReadingOrder(chapters);
    pageImages = pages;
  } catch (error) {
    readerErrorMessage =
      error instanceof Error
        ? error.message
        : "Unable to load chapter pages right now.";
  }

  const currentIndex = orderedChapters.findIndex(
    (readerChapter) => readerChapter.id === chapter.id
  );
  const previousChapter =
    currentIndex > 0 ? orderedChapters[currentIndex - 1] : null;
  const nextChapter =
    currentIndex >= 0 && currentIndex < orderedChapters.length - 1
      ? orderedChapters[currentIndex + 1]
      : null;
  const chapterLabel = getChapterNumberLabel(chapter);
  const chapterTitle = getChapterTitle(chapter);

  return (
    <main className="relative isolate min-h-screen overflow-hidden px-4 py-6 sm:px-6 lg:px-8">
      <ReadingTracker chapterId={chapter.id} />
      <div className="pointer-events-none absolute inset-0">
        <div className="absolute left-[-8%] top-10 h-72 w-72 rounded-full bg-cyan-400/16 blur-3xl" />
        <div className="absolute bottom-[-10%] right-[-10%] h-80 w-80 rounded-full bg-amber-400/10 blur-3xl" />
      </div>

      <div className="relative mx-auto w-full max-w-5xl">
        <div className="sticky top-4 z-10 rounded-[28px] border border-white/10 bg-[rgba(7,13,28,0.82)] px-5 py-4 shadow-[0_20px_80px_rgba(0,0,0,0.35)] backdrop-blur-xl">
          <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
            <div>
              <p className="text-xs uppercase tracking-[0.45em] text-cyan-300/80">
                Reader
              </p>
              <h1 className="mt-2 text-2xl font-semibold text-white sm:text-3xl">
                {chapterLabel}
              </h1>
              <p className="mt-2 text-sm leading-6 text-slate-300">
                {chapterTitle}
              </p>
            </div>

            <div className="flex flex-wrap gap-3">
              <Link
                href={`/manga/${mangaId}`}
                className="rounded-full border border-white/15 px-4 py-2 text-sm font-medium text-slate-200 transition hover:border-cyan-300/40 hover:bg-white/5"
              >
                Back to details
              </Link>
              <ChapterNavButton chapter={previousChapter} label="Previous" />
              <ChapterNavButton chapter={nextChapter} label="Next" />
            </div>
          </div>
        </div>

        {readerErrorMessage ? (
          <div className="mt-8">
            <ErrorState message={readerErrorMessage} />
          </div>
        ) : pageImages.length > 0 ? (
          <>
            <section className="mt-8 space-y-5">
              {pageImages.map((pageImage, index) => (
                <article
                  key={pageImage}
                  className="overflow-hidden rounded-[24px] border border-white/10 bg-[rgba(8,14,32,0.82)] shadow-[0_18px_60px_rgba(0,0,0,0.25)]"
                >
                  <div className="border-b border-white/10 px-4 py-3 text-xs uppercase tracking-[0.35em] text-slate-500">
                    Page {index + 1}
                  </div>
                  <Image
                    src={pageImage}
                    alt={`${chapterTitle} page ${index + 1}`}
                    width={1400}
                    height={2000}
                    priority={index === 0}
                    className="h-auto w-full object-contain"
                  />
                </article>
              ))}
            </section>

            <div className="mt-8 flex flex-wrap justify-center gap-3">
              <ChapterNavButton chapter={previousChapter} label="Previous" />
              <ChapterNavButton chapter={nextChapter} label="Next" />
            </div>
          </>
        ) : (
          <div className="mt-8 rounded-[28px] border border-white/10 bg-[rgba(8,14,32,0.78)] p-6 text-center">
            <p className="text-sm leading-7 text-slate-300">
              No reader pages are available for this chapter yet.
            </p>
          </div>
        )}
      </div>
    </main>
  );
}
