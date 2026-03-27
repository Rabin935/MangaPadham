"use client";

import { useEffect, useRef } from "react";
import { useAuth } from "@/components/auth/auth-provider";

type ReadingTrackerProps = {
  chapterId: string;
};

export function ReadingTracker({ chapterId }: ReadingTrackerProps) {
  const { isAuthenticated, refreshAuth, user } = useAuth();
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

        if (!response.ok || cancelled) {
          return;
        }

        await refreshAuth();
      } catch {
        // Keep the reader resilient even if saving progress fails.
      }
    }

    void trackReadingProgress();

    return () => {
      cancelled = true;
    };
  }, [chapterId, isAuthenticated, refreshAuth, user?.continueReading?.chapterId]);

  return null;
}
