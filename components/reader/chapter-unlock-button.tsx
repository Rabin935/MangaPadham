"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { useAuth } from "@/components/auth/auth-provider";
import { CoinIcon, LockIcon } from "@/components/ui/icons";

type UnlockChapterResponse = {
  success?: boolean;
  unlocked?: boolean;
  coins?: number;
  unlockedChapters?: string[];
  message?: string;
};

type ChapterUnlockButtonProps = {
  chapterId: string;
  unlockPrice: number;
  redirectTo?: string;
  size?: "default" | "compact";
  className?: string;
  showBalanceHint?: boolean;
};

async function readUnlockPayload(response: Response) {
  try {
    return (await response.json()) as UnlockChapterResponse;
  } catch {
    return null;
  }
}

function getButtonClassName(size: ChapterUnlockButtonProps["size"]) {
  if (size === "compact") {
    return "rounded-full bg-amber-300 px-4 py-2 text-sm font-semibold text-slate-950 transition hover:bg-amber-200 disabled:cursor-not-allowed disabled:bg-amber-200/50";
  }

  return "rounded-full bg-amber-300 px-5 py-2.5 text-sm font-semibold text-slate-950 transition hover:bg-amber-200 disabled:cursor-not-allowed disabled:bg-amber-200/50";
}

function getPlaceholderClassName(size: ChapterUnlockButtonProps["size"]) {
  if (size === "compact") {
    return "rounded-full border border-white/10 px-4 py-2 text-sm font-medium text-slate-400";
  }

  return "rounded-full border border-white/10 px-5 py-2.5 text-sm font-medium text-slate-400";
}

export function ChapterUnlockButton({
  chapterId,
  unlockPrice,
  redirectTo,
  size = "default",
  className = "",
  showBalanceHint = true,
}: ChapterUnlockButtonProps) {
  const router = useRouter();
  const { isAuthenticated, isLoading, updateUser, user } = useAuth();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [message, setMessage] = useState<string | null>(null);
  const nextPath = redirectTo ?? `/reader/${chapterId}`;
  const missingCoins =
    user && user.coins < unlockPrice ? unlockPrice - user.coins : 0;

  async function handleUnlock() {
    if (!isAuthenticated || isSubmitting || missingCoins > 0) {
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
        if (
          typeof payload?.coins === "number" ||
          Array.isArray(payload?.unlockedChapters)
        ) {
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

      if (redirectTo) {
        router.push(redirectTo);
        return;
      }

      router.refresh();
    } catch {
      setMessage("Unable to unlock this chapter right now.");
    } finally {
      setIsSubmitting(false);
    }
  }

  return (
    <div className={`grid gap-2 ${className}`.trim()}>
      {isLoading ? (
        <span className={getPlaceholderClassName(size)}>Checking coins</span>
      ) : isAuthenticated ? (
        <button
          type="button"
          onClick={() => {
            void handleUnlock();
          }}
          disabled={isSubmitting || missingCoins > 0}
          className={getButtonClassName(size)}
        >
          <span className="inline-flex items-center gap-2">
            <LockIcon className="h-4 w-4" />
            <span>
              {isSubmitting ? "Unlocking..." : `Unlock with ${unlockPrice} coins`}
            </span>
            <CoinIcon className="h-4 w-4" />
          </span>
        </button>
      ) : (
        <Link
          href={`/login?next=${encodeURIComponent(nextPath)}`}
          className={getButtonClassName(size)}
        >
          <span className="inline-flex items-center gap-2">
            <LockIcon className="h-4 w-4" />
            <span>Login to unlock</span>
          </span>
        </Link>
      )}

      {showBalanceHint && isAuthenticated && !isLoading && user ? (
        <p className="text-sm text-slate-300">
          {missingCoins > 0
            ? `You need ${missingCoins} more coins to unlock this chapter.`
            : `Balance: ${user.coins} coins. Unlock and continue reading instantly.`}
        </p>
      ) : null}

      {message ? (
        <p className="rounded-[20px] border border-rose-300/20 bg-rose-400/8 px-4 py-3 text-sm text-rose-100">
          {message}
        </p>
      ) : null}
    </div>
  );
}
