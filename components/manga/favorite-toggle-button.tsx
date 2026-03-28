"use client";

import { useRouter } from "next/navigation";
import { useEffect, useState, useTransition } from "react";
import { useAuth } from "@/components/auth/auth-provider";

type FavoriteToggleButtonProps = {
  mangaId: string;
};

type FavoriteResponse = {
  success?: boolean;
  message?: string;
  isFavorite?: boolean;
  favoriteMangaIds?: string[];
};

async function readFavoritePayload(response: Response) {
  try {
    return (await response.json()) as FavoriteResponse;
  } catch {
    return null;
  }
}

export function FavoriteToggleButton({
  mangaId,
}: FavoriteToggleButtonProps) {
  const router = useRouter();
  const [, startTransition] = useTransition();
  const { isAuthenticated, isLoading, refreshAuth, updateUser, user } =
    useAuth();
  const [message, setMessage] = useState<string | null>(null);
  const [isPending, setIsPending] = useState(false);
  const [favoriteMangaIds, setFavoriteMangaIds] = useState<string[]>(
    user?.favoriteMangaIds ?? []
  );
  const isFavorite = favoriteMangaIds.includes(mangaId);

  useEffect(() => {
    setFavoriteMangaIds(user?.favoriteMangaIds ?? []);
  }, [user?.favoriteMangaIds]);

  async function handleToggleFavorite() {
    if (isLoading) {
      return;
    }

    if (!isAuthenticated) {
      startTransition(() => {
        router.push(`/login?next=${encodeURIComponent(`/manga/${mangaId}`)}`);
      });
      return;
    }

    setMessage(null);
    setIsPending(true);

    try {
      const response = await fetch("/api/user/favorites", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        credentials: "include",
        body: JSON.stringify({
          mangaId,
        }),
      });

      const payload = await readFavoritePayload(response);

      if (!response.ok) {
        setMessage(payload?.message || "Unable to update favorites right now.");
        return;
      }

      if (Array.isArray(payload?.favoriteMangaIds)) {
        setFavoriteMangaIds(payload.favoriteMangaIds);
        updateUser((currentUser) =>
          currentUser
            ? {
                ...currentUser,
                favoriteMangaIds: payload.favoriteMangaIds ?? [],
              }
            : currentUser
        );
      } else if (typeof payload?.isFavorite === "boolean") {
        const nextFavoriteMangaIds = payload.isFavorite
          ? [...new Set([...favoriteMangaIds, mangaId])]
          : favoriteMangaIds.filter(
              (favoriteMangaId) => favoriteMangaId !== mangaId
            );

        setFavoriteMangaIds(nextFavoriteMangaIds);
        updateUser((currentUser) =>
          currentUser
            ? {
                ...currentUser,
                favoriteMangaIds: nextFavoriteMangaIds,
              }
            : currentUser
        );
      }

      try {
        await refreshAuth();
        router.refresh();
      } catch {
        // Keep the local favorite state if the background refresh fails.
      }
    } catch {
      setMessage("Unable to update favorites right now.");
    } finally {
      setIsPending(false);
    }
  }

  return (
    <div className="flex flex-col gap-3">
      <button
        type="button"
        onClick={() => {
          void handleToggleFavorite();
        }}
        disabled={isPending || isLoading}
        className={`rounded-full px-6 py-3 text-sm font-semibold transition ${
          isFavorite
            ? "border border-amber-300/30 bg-amber-300/12 text-amber-100 hover:bg-amber-300/18"
            : "border border-white/15 bg-transparent text-slate-200 hover:border-cyan-300/40 hover:bg-white/5"
        } ${isPending || isLoading ? "cursor-not-allowed opacity-70" : ""}`}
      >
        {isPending
          ? "Updating..."
          : isLoading
            ? "Loading..."
          : isFavorite
            ? "Remove favorite"
            : "Add to favorites"}
      </button>

      {message ? (
        <p className="text-sm leading-6 text-rose-200">{message}</p>
      ) : null}
    </div>
  );
}
