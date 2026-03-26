import Image from "next/image";
import type {
  CoverArtRelationship,
  LocalizedString,
  Manga,
} from "@/types/mangadex";
import { getMangaList } from "@/lib/mangadex";

function getLocalizedText(
  values: LocalizedString | undefined,
  fallback: string
) {
  if (!values) {
    return fallback;
  }

  return values.en ?? values["ja-ro"] ?? values.ja ?? Object.values(values)[0] ?? fallback;
}

function getCoverImageUrl(manga: Manga) {
  const coverArt = manga.relationships.find(
    (relationship): relationship is CoverArtRelationship =>
      relationship.type === "cover_art" &&
      typeof relationship.attributes === "object" &&
      relationship.attributes !== null &&
      "fileName" in relationship.attributes &&
      typeof relationship.attributes.fileName === "string"
  );

  if (!coverArt?.attributes?.fileName) {
    return null;
  }

  return `https://uploads.mangadex.org/covers/${manga.id}/${coverArt.attributes.fileName}.256.jpg`;
}

function getGenreLabel(manga: Manga) {
  const genres = manga.attributes.tags
    .filter((tag) => tag.attributes.group === "genre")
    .map((tag) => getLocalizedText(tag.attributes.name, "Unknown genre"))
    .slice(0, 2);

  return genres.length > 0 ? genres.join(" / ") : "Unknown genre";
}

function MangaCard({ manga }: { manga: Manga }) {
  const title = getLocalizedText(manga.attributes.title, "Untitled manga");
  const genre = getGenreLabel(manga);
  const coverImageUrl = getCoverImageUrl(manga);

  return (
    <article className="group overflow-hidden rounded-[28px] border border-white/10 bg-[rgba(7,13,28,0.78)] shadow-[0_24px_80px_rgba(0,0,0,0.35)] backdrop-blur-xl transition duration-300 hover:-translate-y-1 hover:border-cyan-300/35">
      <div className="relative aspect-[4/5] overflow-hidden bg-[linear-gradient(180deg,rgba(34,211,238,0.2),rgba(8,14,32,0.95))]">
        {coverImageUrl ? (
          <Image
            src={coverImageUrl}
            alt={title}
            fill
            sizes="(min-width: 1280px) 25vw, (min-width: 640px) 50vw, 100vw"
            className="object-cover transition duration-500 group-hover:scale-[1.03]"
          />
        ) : (
          <div className="flex h-full items-center justify-center px-6 text-center text-sm font-medium uppercase tracking-[0.35em] text-slate-200/70">
            No Cover
          </div>
        )}

        <div className="pointer-events-none absolute inset-x-0 bottom-0 h-32 bg-gradient-to-t from-[rgba(2,6,23,0.95)] to-transparent" />
      </div>

      <div className="space-y-3 p-5">
        <p className="text-xs uppercase tracking-[0.35em] text-amber-300/80">
          Genre
        </p>
        <h2 className="line-clamp-2 text-xl font-semibold leading-8 text-white">
          {title}
        </h2>
        <p className="text-sm leading-6 text-slate-300">{genre}</p>
      </div>
    </article>
  );
}

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
  let mangaList: Manga[] = [];
  let errorMessage: string | null = null;

  try {
    mangaList = await getMangaList();
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
            Browse a live list of manga with cover art, titles, and genre tags
            pulled directly from the MangaDex API.
          </p>
        </header>

        {errorMessage ? (
          <div className="mt-10">
            <ErrorState message={errorMessage} />
          </div>
        ) : (
          <section className="mt-10 grid gap-6 sm:grid-cols-2 xl:grid-cols-4">
            {mangaList.map((manga) => (
              <MangaCard key={manga.id} manga={manga} />
            ))}
          </section>
        )}
      </div>
    </main>
  );
}
