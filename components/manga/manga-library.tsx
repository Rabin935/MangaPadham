"use client";

import Image from "next/image";
import Link from "next/link";
import { useEffect, useEffectEvent, useRef, useState } from "react";
import {
  getCoverImageUrl,
  getGenreLabels,
  getLocalizedText,
  getMangaTitle,
} from "@/lib/manga-display";
import type { Manga, MangaTag } from "@/types/mangadex";

type MangaLibraryProps = {
  initialManga: Manga[];
  initialHasMore: boolean;
  initialNextOffset: number;
  genreTags: MangaTag[];
};

type MangaSearchResponse = {
  success?: boolean;
  message?: string;
  manga?: Manga[];
  offset?: number;
  limit?: number;
  total?: number;
  hasMore?: boolean;
};

const PAGE_SIZE = 20;

async function readMangaPayload(response: Response) {
  try {
    return (await response.json()) as MangaSearchResponse;
  } catch {
    return null;
  }
}

function buildSearchUrl(title: string, genreTagId: string, offset = 0) {
  const searchParams = new URLSearchParams();

  if (title) {
    searchParams.set("title", title);
  }

  if (genreTagId) {
    searchParams.set("genre", genreTagId);
  }

  searchParams.set("limit", String(PAGE_SIZE));
  searchParams.set("offset", String(offset));

  const queryString = searchParams.toString();

  return queryString ? `/api/manga?${queryString}` : "/api/manga";
}

function MangaCard({ manga }: { manga: Manga }) {
  const title = getMangaTitle(manga);
  const genre = getGenreLabels(manga).slice(0, 2).join(" / ") || "Unknown genre";
  const coverImageUrl = getCoverImageUrl(manga);

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
          Genre
        </p>
        <h2 className="line-clamp-2 text-xl font-semibold leading-8 text-white">
          {title}
        </h2>
        <p className="text-sm leading-6 text-slate-300">{genre}</p>
      </div>
    </Link>
  );
}

function MangaGridSkeleton() {
  return (
    <section className="grid gap-6 sm:grid-cols-2 xl:grid-cols-4">
      {Array.from({ length: 8 }, (_, index) => (
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

function BottomLoadingSpinner() {
  return (
    <div className="flex flex-col items-center justify-center gap-3 py-8 text-sm text-slate-400">
      <span className="h-10 w-10 animate-spin rounded-full border-2 border-cyan-300/20 border-t-cyan-300" />
      <span>Loading more manga...</span>
    </div>
  );
}

function EmptyState({
  hasActiveFilters,
}: {
  hasActiveFilters: boolean;
}) {
  return (
    <div className="rounded-[28px] border border-white/10 bg-white/5 p-6">
      <p className="text-xs uppercase tracking-[0.35em] text-cyan-300/80">
        No manga found
      </p>
      <p className="mt-4 max-w-2xl text-sm leading-7 text-slate-300">
        {hasActiveFilters
          ? "Try a different title or switch the genre filter to broaden the results."
          : "No manga is available right now. Please try again in a moment."}
      </p>
    </div>
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

export function MangaLibrary({
  initialManga,
  initialHasMore,
  initialNextOffset,
  genreTags,
}: MangaLibraryProps) {
  const [searchTerm, setSearchTerm] = useState("");
  const [debouncedSearchTerm, setDebouncedSearchTerm] = useState("");
  const [selectedGenreTagId, setSelectedGenreTagId] = useState("");
  const [mangaList, setMangaList] = useState(initialManga);
  const [hasMore, setHasMore] = useState(initialHasMore);
  const [nextOffset, setNextOffset] = useState(initialNextOffset);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [loadMoreErrorMessage, setLoadMoreErrorMessage] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [isLoadingMore, setIsLoadingMore] = useState(false);
  const loadMoreRef = useRef<HTMLDivElement | null>(null);
  const isLoadMorePendingRef = useRef(false);

  useEffect(() => {
    const timeoutId = window.setTimeout(() => {
      setDebouncedSearchTerm(searchTerm.trim());
    }, 350);

    return () => {
      window.clearTimeout(timeoutId);
    };
  }, [searchTerm]);

  useEffect(() => {
    const hasActiveFilters =
      Boolean(debouncedSearchTerm) || Boolean(selectedGenreTagId);

    if (!hasActiveFilters) {
      setMangaList(initialManga);
      setHasMore(initialHasMore);
      setNextOffset(initialNextOffset);
      setErrorMessage(null);
      setLoadMoreErrorMessage(null);
      setIsLoading(false);
      setIsLoadingMore(false);
      isLoadMorePendingRef.current = false;
      return;
    }

    const controller = new AbortController();
    let active = true;

    async function loadManga() {
      setIsLoading(true);
      setErrorMessage(null);
      setLoadMoreErrorMessage(null);

      try {
        const response = await fetch(
          buildSearchUrl(debouncedSearchTerm, selectedGenreTagId, 0),
          {
            method: "GET",
            cache: "no-store",
            signal: controller.signal,
          }
        );

        const payload = await readMangaPayload(response);

        if (!active) {
          return;
        }

        if (!response.ok) {
          setErrorMessage(payload?.message || "Unable to load manga right now.");
          return;
        }

        const nextMangaList = payload?.manga ?? [];

        setMangaList(nextMangaList);
        setHasMore(Boolean(payload?.hasMore));
        setNextOffset((payload?.offset ?? 0) + nextMangaList.length);
      } catch (error) {
        if (controller.signal.aborted || !active) {
          return;
        }

        setErrorMessage(
          error instanceof Error
            ? error.message
            : "Unable to load manga right now."
        );
      } finally {
        if (active) {
          setIsLoading(false);
          setIsLoadingMore(false);
        }
      }
    }

    void loadManga();

    return () => {
      active = false;
      controller.abort();
    };
  }, [
    debouncedSearchTerm,
    initialHasMore,
    initialManga,
    initialNextOffset,
    selectedGenreTagId,
  ]);

  const loadMoreManga = useEffectEvent(async () => {
    if (
      isLoading ||
      isLoadingMore ||
      isLoadMorePendingRef.current ||
      !hasMore
    ) {
      return;
    }

    isLoadMorePendingRef.current = true;
    setIsLoadingMore(true);
    setLoadMoreErrorMessage(null);

    try {
      const response = await fetch(
        buildSearchUrl(debouncedSearchTerm, selectedGenreTagId, nextOffset),
        {
          method: "GET",
          cache: "no-store",
        }
      );

      const payload = await readMangaPayload(response);

      if (!response.ok) {
        setLoadMoreErrorMessage(
          payload?.message || "Unable to load more manga right now."
        );
        return;
      }

      const nextPage = payload?.manga ?? [];

      setMangaList((currentMangaList) => {
        const existingIds = new Set(currentMangaList.map((manga) => manga.id));
        const uniqueNextPage = nextPage.filter((manga) => !existingIds.has(manga.id));

        return [...currentMangaList, ...uniqueNextPage];
      });
      setHasMore(Boolean(payload?.hasMore));
      setNextOffset((payload?.offset ?? nextOffset) + nextPage.length);
    } catch (error) {
      setLoadMoreErrorMessage(
        error instanceof Error
          ? error.message
          : "Unable to load more manga right now."
      );
    } finally {
      isLoadMorePendingRef.current = false;
      setIsLoadingMore(false);
    }
  });

  useEffect(() => {
    const loadMoreElement = loadMoreRef.current;

    if (
      !loadMoreElement ||
      isLoading ||
      isLoadingMore ||
      !hasMore ||
      Boolean(errorMessage) ||
      Boolean(loadMoreErrorMessage)
    ) {
      return;
    }

    const observer = new IntersectionObserver(
      (entries) => {
        const [entry] = entries;

        if (entry?.isIntersecting) {
          void loadMoreManga();
        }
      },
      {
        rootMargin: "240px 0px",
      }
    );

    observer.observe(loadMoreElement);

    return () => {
      observer.disconnect();
    };
  }, [
    errorMessage,
    hasMore,
    isLoading,
    isLoadingMore,
    loadMoreErrorMessage,
  ]);

  const hasActiveFilters = Boolean(debouncedSearchTerm) || Boolean(selectedGenreTagId);

  return (
    <>
      <section className="mt-8 rounded-[28px] border border-white/10 bg-white/5 p-5 sm:p-6">
        <div className="grid gap-4 lg:grid-cols-[1fr_260px]">
          <label className="block">
            <span className="mb-2 block text-xs uppercase tracking-[0.35em] text-slate-400">
              Search title
            </span>
            <input
              type="search"
              value={searchTerm}
              onChange={(event) => {
                setSearchTerm(event.target.value);
              }}
              placeholder="Search manga by title"
              className="w-full rounded-[22px] border border-white/10 bg-[rgba(8,14,32,0.9)] px-4 py-3.5 text-base text-white outline-none transition placeholder:text-slate-500 focus:-translate-y-0.5 focus:border-cyan-300 focus:ring-4 focus:ring-cyan-300/10"
            />
          </label>

          <label className="block">
            <span className="mb-2 block text-xs uppercase tracking-[0.35em] text-slate-400">
              Genre filter
            </span>
            <select
              value={selectedGenreTagId}
              onChange={(event) => {
                setSelectedGenreTagId(event.target.value);
              }}
              className="w-full rounded-[22px] border border-white/10 bg-[rgba(8,14,32,0.9)] px-4 py-3.5 text-base text-white outline-none transition focus:-translate-y-0.5 focus:border-cyan-300 focus:ring-4 focus:ring-cyan-300/10"
            >
              <option value="">All genres</option>
              {genreTags.map((genreTag) => (
                <option key={genreTag.id} value={genreTag.id}>
                  {getLocalizedText(genreTag.attributes.name, "Unknown genre")}
                </option>
              ))}
            </select>
          </label>
        </div>

        <div className="mt-4 flex flex-col gap-2 text-sm text-slate-400 sm:flex-row sm:items-center sm:justify-between">
          <p>
            {hasActiveFilters
              ? `Showing ${mangaList.length} matching manga${hasMore ? " so far" : ""}.`
              : `Showing ${mangaList.length} featured manga${hasMore ? " so far" : ""}.`}
          </p>
          <p className={isLoading || isLoadingMore ? "text-cyan-200" : ""}>
            {isLoading
              ? "Updating results..."
              : isLoadingMore
                ? "Loading more manga..."
                : "Results update automatically as you type."}
          </p>
        </div>
      </section>

      <div className="mt-10" aria-busy={isLoading}>
        {errorMessage ? (
          <ErrorState message={errorMessage} />
        ) : isLoading && mangaList.length === 0 ? (
          <MangaGridSkeleton />
        ) : mangaList.length > 0 ? (
          <>
            <section className="grid gap-6 sm:grid-cols-2 xl:grid-cols-4">
              {mangaList.map((manga) => (
                <MangaCard key={manga.id} manga={manga} />
              ))}
            </section>

            <div ref={loadMoreRef} className="mt-6 min-h-10">
              {loadMoreErrorMessage ? (
                <div className="rounded-[22px] border border-rose-300/20 bg-rose-400/8 px-4 py-3 text-sm text-rose-100">
                  {loadMoreErrorMessage}
                </div>
              ) : null}
              {isLoadingMore ? <BottomLoadingSpinner /> : null}
            </div>
          </>
        ) : (
          <EmptyState hasActiveFilters={hasActiveFilters} />
        )}
      </div>
    </>
  );
}
