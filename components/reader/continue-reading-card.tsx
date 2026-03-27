"use client";

import Link from "next/link";
import type { ContinueReading } from "@/types/auth";
import { getReaderPageHref } from "@/lib/chapter-display";

type ContinueReadingCardProps = {
  continueReading: ContinueReading | null;
};

export function ContinueReadingCard({
  continueReading,
}: ContinueReadingCardProps) {
  if (!continueReading) {
    return (
      <section className="rounded-[28px] border border-white/10 bg-white/5 p-6">
        <p className="text-xs uppercase tracking-[0.35em] text-cyan-300/80">
          Continue Reading
        </p>
        <h2 className="mt-3 text-2xl font-semibold text-white">
          Your next chapter will show up here.
        </h2>
        <p className="mt-4 max-w-2xl text-sm leading-7 text-slate-300">
          Start reading any chapter and we will save your latest progress so you
          can jump back in from the dashboard.
        </p>
        <Link
          href="/manga"
          className="mt-6 inline-flex rounded-full bg-cyan-300 px-5 py-2.5 text-sm font-semibold text-slate-950 transition hover:bg-cyan-200"
        >
          Browse manga
        </Link>
      </section>
    );
  }

  return (
    <section className="rounded-[28px] border border-white/10 bg-white/5 p-6">
      <p className="text-xs uppercase tracking-[0.35em] text-cyan-300/80">
        Continue Reading
      </p>
      <h2 className="mt-3 text-2xl font-semibold text-white">
        {continueReading.mangaTitle}
      </h2>
      <p className="mt-3 text-sm font-semibold text-amber-200">
        {continueReading.chapterNumber}
      </p>
      <p className="mt-2 text-sm leading-7 text-slate-300">
        {continueReading.chapterTitle}
      </p>

      <div className="mt-6 flex flex-wrap gap-3">
        <Link
          href={getReaderPageHref(continueReading.chapterId)}
          className="rounded-full bg-cyan-300 px-5 py-2.5 text-sm font-semibold text-slate-950 transition hover:bg-cyan-200"
        >
          Continue now
        </Link>
        <Link
          href={`/manga/${continueReading.mangaId}`}
          className="rounded-full border border-white/15 px-5 py-2.5 text-sm font-medium text-slate-200 transition hover:border-cyan-300/40 hover:bg-white/5"
        >
          View manga
        </Link>
      </div>
    </section>
  );
}
