"use client";

import { useEffect, useRef } from "react";
import { useAuth } from "@/components/auth/auth-provider";

type ReadingTrackerProps = {
  chapterId: string;
};

type ContinueReadingResponse = {
  success?: boolean;
  continueReading?: {
    mangaId: string;
    mangaTitle: string;
    chapterId: string;
    chapterNumber: string;
    chapterTitle: string;
  };
  readChapters?: string[];
  lastReadAt?: string | null;
};

type EarnCoinsResponse = {
  success?: boolean;
  earned?: boolean;
  coins?: number;
  totalCoinsEarned?: number;
};

async function readResponsePayload<T>(response: Response) {
  try {
    return (await response.json()) as T;
  } catch {
    return null;
  }
}

export function ReadingTracker({ chapterId }: ReadingTrackerProps) {
  const { isAuthenticated, refreshAuth, updateUser } = useAuth();
  const lastTrackedChapterRef = useRef<string | null>(null);

  useEffect(() => {
    if (!isAuthenticated) {
      return;
    }

    if (lastTrackedChapterRef.current === chapterId) {
      return;
    }

    lastTrackedChapterRef.current = chapterId;
    let cancelled = false;

    async function trackReadingProgress() {
      try {
        const response = await fetch("/api/coins/earn", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          credentials: "include",
          body: JSON.stringify({
            chapterId,
          }),
        });

        const payload = await readResponsePayload<EarnCoinsResponse>(response);

        if (!response.ok || cancelled) {
          return;
        }

        if (typeof payload?.coins === "number") {
          updateUser((currentUser) =>
            currentUser
              ? {
                  ...currentUser,
                  coins: payload.coins,
                  totalCoinsEarned:
                    typeof payload.totalCoinsEarned === "number"
                      ? payload.totalCoinsEarned
                      : currentUser.totalCoinsEarned,
                }
              : currentUser
          );
        }
      } catch {
        // Keep the reader resilient even if awarding coins fails.
      }

      try {
        const response = await fetch("/api/user/continue-reading", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          credentials: "include",
          body: JSON.stringify({
            chapterId,
          }),
        });

        const payload = await readResponsePayload<ContinueReadingResponse>(
          response
        );

        if (!response.ok || cancelled) {
          return;
        }

        if (payload?.continueReading) {
          updateUser((currentUser) =>
            currentUser
              ? {
                  ...currentUser,
                  continueReading: payload.continueReading ?? null,
                  lastReadAt:
                    typeof payload.lastReadAt === "string"
                      ? payload.lastReadAt
                      : currentUser.lastReadAt,
                  readChapters: Array.isArray(payload.readChapters)
                    ? payload.readChapters
                    : currentUser.readChapters.includes(chapterId)
                      ? currentUser.readChapters
                      : [...currentUser.readChapters, chapterId],
                }
              : currentUser
          );
        }

        try {
          await refreshAuth();
        } catch {
          // Keep the optimistic reading state if the background refresh fails.
        }
      } catch {
        // Keep the reader resilient even if saving progress fails.
      }
    }

    void trackReadingProgress();

    return () => {
      cancelled = true;
    };
  }, [
    chapterId,
    isAuthenticated,
    refreshAuth,
    updateUser,
  ]);

  return null;
}
