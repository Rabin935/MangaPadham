import { MangaLibrary } from "@/components/manga/manga-library";
import { getGenreTags, getMangaList } from "@/lib/mangadex";
import { getLocalizedText } from "@/lib/manga-display";
import type { Manga, MangaTag } from "@/types/mangadex";

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

export default async function MangaPage() {
  let initialManga: Manga[] = [];
  let genreTags: MangaTag[] = [];
  let errorMessage: string | null = null;

  try {
    const [mangaList, availableGenreTags] = await Promise.all([
      getMangaList(),
      getGenreTags(),
    ]);

    initialManga = mangaList;
    genreTags = [...availableGenreTags].sort((leftTag, rightTag) =>
      getLocalizedText(leftTag.attributes.name, "Unknown genre").localeCompare(
        getLocalizedText(rightTag.attributes.name, "Unknown genre")
      )
    );
  } catch (error) {
    errorMessage =
      error instanceof Error
        ? error.message
        : "Unable to load manga right now.";
  }

  return (
    <main className="relative isolate min-h-screen overflow-hidden px-4 py-8 sm:px-6 lg:px-8">
      <div className="pointer-events-none absolute inset-0">
        <div className="absolute left-[-8%] top-12 h-72 w-72 rounded-full bg-cyan-400/18 blur-3xl" />
        <div className="absolute bottom-[-8%] right-[-10%] h-80 w-80 rounded-full bg-amber-400/10 blur-3xl" />
      </div>

      <div className="relative mx-auto w-full max-w-7xl rounded-[32px] border border-white/10 bg-[rgba(7,13,28,0.72)] px-6 py-8 shadow-[0_40px_140px_rgba(0,0,0,0.45)] backdrop-blur-xl sm:px-10 sm:py-10">
        <header className="border-b border-white/10 pb-8">
          <p className="text-xs uppercase tracking-[0.45em] text-cyan-300/80">
            Manga Library
          </p>
          <h1 className="mt-3 text-4xl font-semibold tracking-tight text-white sm:text-5xl">
            Discover manga from MangaDex.
          </h1>
          <p className="mt-4 max-w-2xl text-base leading-8 text-slate-300">
            Search by title, narrow the list by genre, and browse live manga
            results without leaving the page.
          </p>
        </header>

        {errorMessage ? (
          <div className="mt-10">
            <ErrorState message={errorMessage} />
          </div>
        ) : (
          <MangaLibrary initialManga={initialManga} genreTags={genreTags} />
        )}
      </div>
    </main>
  );
}
