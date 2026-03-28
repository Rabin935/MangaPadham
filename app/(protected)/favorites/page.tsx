"use client";

import Image from "next/image";
import Link from "next/link";
import { useEffect, useState } from "react";
import { useAuth } from "@/components/auth/auth-provider";
import { getMangaById } from "@/lib/mangadex";
import {
  getCoverImageUrl,
  getGenreLabels,
  getMangaTitle,
} from "@/lib/manga-display";
import type { Manga } from "@/types/mangadex";

function FavoriteCard({ manga }: { manga: Manga }) {
  const title = getMangaTitle(manga);
  const coverImageUrl = getCoverImageUrl(manga);
  const genreLabel = getGenreLabels(manga).slice(0, 2).join(" / ") || "Unknown genre";

  return (
    <Link
      href={`/manga/${manga.id}`}
      className="group block overflow-hidden rounded-[28px] border border-white/10 bg-[rgba(7,13,28,0.78)] shadow-[0_24px_80px_rgba(0,0,0,0.35)] backdrop-blur-xl transition duration-300 hover:-translate-y-1 hover:border-cyan-300/35"
    >
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
          Favorite
        </p>
        <h2 className="line-clamp-2 text-xl font-semibold leading-8 text-white">
          {title}
        </h2>
        <p className="text-sm leading-6 text-slate-300">{genreLabel}</p>
      </div>
    </Link>
  );
}

function FavoritesSkeleton() {
  return (
    <section className="mt-10 grid gap-6 sm:grid-cols-2 xl:grid-cols-4">
      {Array.from({ length: 4 }, (_, index) => (
        <div
          key={index}
          className="overflow-hidden rounded-[28px] border border-white/10 bg-[rgba(7,13,28,0.78)]"
        >
          <div className="aspect-[4/5] animate-pulse bg-white/8" />
          <div className="space-y-3 p-5">
            <div className="h-3 w-20 animate-pulse rounded-full bg-white/10" />
            <div className="h-6 w-full animate-pulse rounded-full bg-white/10" />
            <div className="h-4 w-32 animate-pulse rounded-full bg-white/10" />
          </div>
        </div>
      ))}
    </section>
  );
}

export default function FavoritesPage() {
  const { user } = useAuth();
  const [favoriteManga, setFavoriteManga] = useState<Manga[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  useEffect(() => {
    let active = true;

    async function loadFavoriteManga() {
      if (!user) {
        return;
      }

      const favoriteMangaIds = user.favoriteMangaIds ?? [];

      if (favoriteMangaIds.length === 0) {
        setFavoriteManga([]);
        setIsLoading(false);
        return;
      }

      setIsLoading(true);
      setErrorMessage(null);

      const results = await Promise.allSettled(
        favoriteMangaIds.map((mangaId) => getMangaById(mangaId))
      );

      if (!active) {
        return;
      }

      const fulfilledResults = results
        .filter(
          (result): result is PromiseFulfilledResult<Manga> =>
            result.status === "fulfilled"
        )
        .map((result) => result.value);

      const rejectedResults = results.filter(
        (result) => result.status === "rejected"
      );

      setFavoriteManga(fulfilledResults);
      setIsLoading(false);

      if (fulfilledResults.length === 0 && rejectedResults.length > 0) {
        setErrorMessage("Unable to load your favorite manga right now.");
      }
    }

    void loadFavoriteManga();

    return () => {
      active = false;
    };
  }, [user]);

  if (!user) {
    return null;
  }

  return (
    <main className="relative isolate min-h-screen overflow-hidden px-4 py-8 sm:px-6 lg:px-8">
      <div className="pointer-events-none absolute inset-0">
        <div className="absolute left-[-10%] top-8 h-80 w-80 rounded-full bg-cyan-400/16 blur-3xl" />
        <div className="absolute bottom-[-12%] right-[-8%] h-96 w-96 rounded-full bg-amber-400/10 blur-3xl" />
      </div>

      <div className="relative mx-auto w-full max-w-7xl rounded-[32px] border border-white/10 bg-[rgba(7,13,28,0.78)] px-6 py-8 shadow-[0_40px_140px_rgba(0,0,0,0.55)] backdrop-blur-xl sm:px-10 sm:py-10">
        <header className="flex flex-col gap-6 border-b border-white/10 pb-8 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <p className="text-xs uppercase tracking-[0.45em] text-cyan-300/80">
              Favorites
            </p>
            <h1 className="mt-3 text-4xl font-semibold tracking-tight text-white sm:text-5xl">
              Your saved manga shelf.
            </h1>
            <p className="mt-4 max-w-2xl text-base leading-8 text-slate-300">
              Keep the series you love close so you can jump back into them
              whenever the mood hits.
            </p>
          </div>

          <div className="flex flex-wrap gap-3">
            <Link
              href="/dashboard"
              className="rounded-full border border-white/15 px-5 py-2.5 text-sm font-medium text-slate-200 transition hover:border-cyan-300/40 hover:bg-white/5"
            >
              Back to dashboard
            </Link>
            <Link
              href="/manga"
              className="rounded-full bg-cyan-300 px-5 py-2.5 text-sm font-semibold text-slate-950 transition hover:bg-cyan-200"
            >
              Browse manga
            </Link>
          </div>
        </header>

        {isLoading ? (
          <FavoritesSkeleton />
        ) : errorMessage ? (
          <div className="mt-10 rounded-[28px] border border-rose-300/20 bg-rose-400/8 p-6 text-center">
            <p className="text-xs uppercase tracking-[0.35em] text-rose-200/70">
              Favorites Error
            </p>
            <p className="mt-4 text-base leading-7 text-slate-200">
              {errorMessage}
            </p>
          </div>
        ) : favoriteManga.length > 0 ? (
          <section className="mt-10 grid gap-6 sm:grid-cols-2 xl:grid-cols-4">
            {favoriteManga.map((manga) => (
              <FavoriteCard key={manga.id} manga={manga} />
            ))}
          </section>
        ) : (
          <div className="mt-10 rounded-[28px] border border-white/10 bg-white/5 p-6">
            <p className="text-xs uppercase tracking-[0.35em] text-cyan-300/80">
              No favorites yet
            </p>
            <p className="mt-4 max-w-2xl text-sm leading-7 text-slate-300">
              Open any manga detail page and use the favorite button to build
              your own saved shelf.
            </p>
          </div>
        )}
      </div>
    </main>
  );
}
