import type { Chapter } from "@/types/mangadex";

function parseChapterNumber(value: string | null) {
  if (!value) {
    return Number.NEGATIVE_INFINITY;
  }

  const parsedValue = Number.parseFloat(value);

  return Number.isFinite(parsedValue) ? parsedValue : Number.NEGATIVE_INFINITY;
}

export function sortChaptersLatestFirst(chapters: Chapter[]) {
  return [...chapters].sort((left, right) => {
    const readableAtDifference =
      new Date(right.attributes.readableAt).getTime() -
      new Date(left.attributes.readableAt).getTime();

    if (readableAtDifference !== 0) {
      return readableAtDifference;
    }

    const chapterNumberDifference =
      parseChapterNumber(right.attributes.chapter) -
      parseChapterNumber(left.attributes.chapter);

    if (chapterNumberDifference !== 0) {
      return chapterNumberDifference;
    }

    return (
      new Date(right.attributes.createdAt).getTime() -
      new Date(left.attributes.createdAt).getTime()
    );
  });
}

export function getChapterNumberLabel(chapter: Chapter) {
  return chapter.attributes.chapter?.trim()
    ? `Chapter ${chapter.attributes.chapter}`
    : "Chapter ?";
}

export function getChapterTitle(chapter: Chapter) {
  return chapter.attributes.title?.trim() || "Untitled chapter";
}

export function getReaderPageHref(mangaId: string, chapterId: string) {
  return `/manga/${mangaId}/chapter/${chapterId}`;
}
