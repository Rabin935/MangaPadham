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

async function readTrackingPayload(response: Response) {
  try {
    return (await response.json()) as ContinueReadingResponse;
  } catch {
    return null;
  }
}

export function ReadingTracker({ chapterId }: ReadingTrackerProps) {
  const { isAuthenticated, refreshAuth, updateUser, user } = useAuth();
  const lastTrackedChapterRef = useRef<string | null>(null);

  useEffect(() => {
    if (!isAuthenticated) {
      return;
    }

    if (user?.continueReading?.chapterId === chapterId) {
      return;
    }

    if (lastTrackedChapterRef.current === chapterId) {
      return;
    }

    lastTrackedChapterRef.current = chapterId;
    let cancelled = false;

    async function trackReadingProgress() {
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

        const payload = await readTrackingPayload(response);

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
    user?.continueReading?.chapterId,
  ]);

  return null;
}
