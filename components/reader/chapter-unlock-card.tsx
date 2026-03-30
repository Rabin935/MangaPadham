"use client";

import Link from "next/link";
import { ChapterUnlockButton } from "@/components/reader/chapter-unlock-button";
import { CoinIcon, LockIcon } from "@/components/ui/icons";

type ChapterUnlockCardProps = {
  chapterId: string;
  mangaId: string;
  unlockPrice: number;
  freeAtLabel: string;
  releaseDelayDays: number;
};

export function ChapterUnlockCard({
  chapterId,
  mangaId,
  unlockPrice,
  freeAtLabel,
  releaseDelayDays,
}: ChapterUnlockCardProps) {
  return (
    <div className="rounded-[28px] border border-amber-300/20 bg-[rgba(8,14,32,0.86)] p-6 shadow-[0_24px_80px_rgba(0,0,0,0.3)]">
      <div className="inline-flex items-center gap-2 rounded-full border border-amber-300/20 bg-amber-300/10 px-3 py-1.5 text-xs font-semibold uppercase tracking-[0.3em] text-amber-100">
        <LockIcon className="h-4 w-4" />
        <span>Chapter Locked</span>
      </div>
      <h2 className="mt-4 text-2xl font-semibold text-white sm:text-3xl">
        This chapter unlocks for free on {freeAtLabel}.
      </h2>
      <p className="mt-3 max-w-2xl text-sm leading-7 text-slate-300">
        New chapters stay locked for {releaseDelayDays} days after release. You
        can wait for the free release or unlock this chapter now for {unlockPrice}
        coins.
      </p>

      <div className="mt-6 grid gap-4 rounded-[24px] border border-white/10 bg-white/5 p-4 sm:grid-cols-2">
        <div className="rounded-[20px] border border-white/10 bg-[rgba(8,14,32,0.78)] p-4">
          <p className="text-xs uppercase tracking-[0.3em] text-slate-500">
            Unlock Price
          </p>
          <p className="mt-3 inline-flex items-center gap-2 text-lg font-semibold text-white">
            <CoinIcon className="h-5 w-5 text-amber-200" />
            {unlockPrice} coins
          </p>
        </div>
        <div className="rounded-[20px] border border-white/10 bg-[rgba(8,14,32,0.78)] p-4">
          <p className="text-xs uppercase tracking-[0.3em] text-slate-500">
            Free Release
          </p>
          <p className="mt-3 text-lg font-semibold text-white">{freeAtLabel}</p>
        </div>
      </div>

      <div className="mt-6 flex flex-wrap gap-3">
        <Link
          href={`/manga/${mangaId}`}
          className="rounded-full border border-white/15 px-5 py-2.5 text-sm font-medium text-slate-200 transition hover:border-cyan-300/40 hover:bg-white/5"
        >
          Back to details
        </Link>
        <ChapterUnlockButton chapterId={chapterId} unlockPrice={unlockPrice} />
      </div>
    </div>
  );
}
