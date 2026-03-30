"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { useAuth } from "@/components/auth/auth-provider";

type ChapterUnlockCardProps = {
  chapterId: string;
  mangaId: string;
  unlockPrice: number;
  freeAtLabel: string;
  releaseDelayDays: number;
};

type UnlockChapterResponse = {
  success?: boolean;
  unlocked?: boolean;
  coins?: number;
  unlockedChapters?: string[];
  message?: string;
};

async function readUnlockPayload(response: Response) {
  try {
    return (await response.json()) as UnlockChapterResponse;
  } catch {
    return null;
  }
}

export function ChapterUnlockCard({
  chapterId,
  mangaId,
  unlockPrice,
  freeAtLabel,
  releaseDelayDays,
}: ChapterUnlockCardProps) {
  const router = useRouter();
  const { isAuthenticated, isLoading, updateUser, user } = useAuth();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [message, setMessage] = useState<string | null>(null);
  const nextPath = `/reader/${chapterId}`;
  const missingCoins =
    user && user.coins < unlockPrice ? unlockPrice - user.coins : 0;

  async function handleUnlock() {
    if (!isAuthenticated || isSubmitting) {
      return;
    }

    setIsSubmitting(true);
    setMessage(null);

    try {
      const response = await fetch("/api/coins/unlock", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        credentials: "include",
        body: JSON.stringify({
          chapterId,
        }),
      });

      const payload = await readUnlockPayload(response);

      if (!response.ok || !payload?.success) {
        if (typeof payload?.coins === "number" || Array.isArray(payload?.unlockedChapters)) {
          updateUser((currentUser) =>
            currentUser
              ? {
                  ...currentUser,
                  coins:
                    typeof payload.coins === "number"
                      ? payload.coins
                      : currentUser.coins,
                  unlockedChapters: Array.isArray(payload.unlockedChapters)
                    ? payload.unlockedChapters
                    : currentUser.unlockedChapters,
                }
              : currentUser
          );
        }

        setMessage(payload?.message || "Unable to unlock this chapter right now.");
        return;
      }

      updateUser((currentUser) =>
        currentUser
          ? {
              ...currentUser,
              coins:
                typeof payload.coins === "number"
                  ? payload.coins
                  : currentUser.coins,
              unlockedChapters: Array.isArray(payload.unlockedChapters)
                ? payload.unlockedChapters
                : currentUser.unlockedChapters.includes(chapterId)
                  ? currentUser.unlockedChapters
                  : [...currentUser.unlockedChapters, chapterId],
            }
          : currentUser
      );

      router.refresh();
    } catch {
      setMessage("Unable to unlock this chapter right now.");
    } finally {
      setIsSubmitting(false);
    }
  }

  return (
    <div className="rounded-[28px] border border-amber-300/20 bg-[rgba(8,14,32,0.86)] p-6 shadow-[0_24px_80px_rgba(0,0,0,0.3)]">
      <p className="text-xs uppercase tracking-[0.35em] text-amber-300/80">
        Chapter Locked
      </p>
      <h2 className="mt-4 text-2xl font-semibold text-white sm:text-3xl">
        This chapter unlocks for free on {freeAtLabel}.
      </h2>
      <p className="mt-3 max-w-2xl text-sm leading-7 text-slate-300">
        New chapters stay locked for {releaseDelayDays} days after release. You
        can wait for the free release or unlock this chapter now for {unlockPrice}
        coins.
      </p>

      <div className="mt-6 flex flex-wrap gap-3">
        <Link
          href={`/manga/${mangaId}`}
          className="rounded-full border border-white/15 px-5 py-2.5 text-sm font-medium text-slate-200 transition hover:border-cyan-300/40 hover:bg-white/5"
        >
          Back to details
        </Link>

        {isLoading ? (
          <span className="rounded-full border border-white/10 px-5 py-2.5 text-sm font-medium text-slate-400">
            Checking account
          </span>
        ) : isAuthenticated ? (
          <button
            type="button"
            onClick={() => {
              void handleUnlock();
            }}
            disabled={isSubmitting || Boolean(missingCoins)}
            className="rounded-full bg-amber-300 px-5 py-2.5 text-sm font-semibold text-slate-950 transition hover:bg-amber-200 disabled:cursor-not-allowed disabled:bg-amber-200/50"
          >
            {isSubmitting
              ? "Unlocking..."
              : `Unlock for ${unlockPrice} coins`}
          </button>
        ) : (
          <Link
            href={`/login?next=${encodeURIComponent(nextPath)}`}
            className="rounded-full bg-cyan-300 px-5 py-2.5 text-sm font-semibold text-slate-950 transition hover:bg-cyan-200"
          >
            Login to unlock
          </Link>
        )}
      </div>

      {isAuthenticated && !isLoading && user ? (
        <p className="mt-4 text-sm text-slate-300">
          You have <span className="font-semibold text-white">{user.coins}</span>{" "}
          coins.
          {missingCoins > 0
            ? ` Earn ${missingCoins} more to unlock this chapter.`
            : " You have enough coins to unlock it now."}
        </p>
      ) : null}

      {message ? (
        <p className="mt-4 rounded-[20px] border border-rose-300/20 bg-rose-400/8 px-4 py-3 text-sm text-rose-100">
          {message}
        </p>
      ) : null}
    </div>
  );
}
