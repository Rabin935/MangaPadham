import type { Chapter } from "@/types/mangadex";

export const CHAPTER_UNLOCK_PRICE = 20;
export const CHAPTER_RELEASE_DELAY_DAYS = 3;

const DAY_IN_MS = 24 * 60 * 60 * 1000;

function getChapterReleaseTimestamp(chapter: Pick<Chapter, "attributes">) {
  return new Date(chapter.attributes.readableAt).getTime();
}

export function getChapterReleaseDate(chapter: Pick<Chapter, "attributes">) {
  return new Date(getChapterReleaseTimestamp(chapter));
}

export function getChapterFreeAt(
  chapter: Pick<Chapter, "attributes">,
  releaseDelayDays = CHAPTER_RELEASE_DELAY_DAYS
) {
  return new Date(
    getChapterReleaseTimestamp(chapter) + releaseDelayDays * DAY_IN_MS
  );
}

export function isChapterFree(
  chapter: Pick<Chapter, "attributes">,
  now = new Date(),
  releaseDelayDays = CHAPTER_RELEASE_DELAY_DAYS
) {
  return getChapterFreeAt(chapter, releaseDelayDays).getTime() <= now.getTime();
}

export function isChapterUnlockedForUser(
  chapterId: string,
  unlockedChapterIds: string[] = []
) {
  return unlockedChapterIds.includes(chapterId);
}

export function getChapterAccessState(
  chapter: Pick<Chapter, "id" | "attributes">,
  unlockedChapterIds: string[] = [],
  now = new Date()
) {
  const isFree = isChapterFree(chapter, now);
  const isUnlocked = isChapterUnlockedForUser(chapter.id, unlockedChapterIds);
  const releaseDate = getChapterReleaseDate(chapter);
  const freeAt = getChapterFreeAt(chapter);

  return {
    isFree,
    isUnlocked,
    isLocked: !isFree,
    requiresUnlock: !isFree && !isUnlocked,
    releaseDate,
    freeAt,
    releaseDelayDays: CHAPTER_RELEASE_DELAY_DAYS,
    unlockPrice: CHAPTER_UNLOCK_PRICE,
  };
}
