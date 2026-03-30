import type {
  Chapter,
  ChapterResponse,
  ChapterListResponse,
  Manga,
  MangaDexAtHomeResponse,
  MangaListResponse,
  MangaResponse,
  MangaTag,
  MangaTagListResponse,
} from "@/types/mangadex";

export const MANGADEX_BASE_URL =
  process.env.NEXT_PUBLIC_MANGADEX_BASE_URL ?? "https://api.mangadex.org";

export type ChapterImageQuality = "data" | "dataSaver";
export type MangaListOptions = {
  title?: string;
  genreTagId?: string;
  limit?: number;
  offset?: number;
};

export type PaginatedMangaListResult = {
  manga: Manga[];
  limit: number;
  offset: number;
  total: number;
  hasMore: boolean;
};

const DEFAULT_MANGA_LIST_LIMIT = 20;
const CHAPTERS_PAGE_LIMIT = 100;

type QueryValue = string | number | boolean;
type SearchParams = Record<
  string,
  QueryValue | QueryValue[] | null | undefined
>;

export class MangaDexRequestError extends Error {
  status?: number;

  constructor(message: string, status?: number) {
    super(message);
    this.name = "MangaDexRequestError";
    this.status = status;
  }
}

function createMangaDexUrl(path: string, searchParams?: SearchParams) {
  const url = new URL(path, MANGADEX_BASE_URL);

  if (!searchParams) {
    return url.toString();
  }

  for (const [key, value] of Object.entries(searchParams)) {
    if (value === undefined || value === null) {
      continue;
    }

    if (Array.isArray(value)) {
      for (const item of value) {
        url.searchParams.append(key, String(item));
      }

      continue;
    }

    url.searchParams.set(key, String(value));
  }

  return url.toString();
}

function getErrorMessage(payload: unknown, fallbackMessage: string) {
  if (!payload || typeof payload !== "object" || !("errors" in payload)) {
    return fallbackMessage;
  }

  const errors = (payload as { errors?: unknown }).errors;

  if (!Array.isArray(errors) || errors.length === 0) {
    return fallbackMessage;
  }

  const message = errors
    .map((error) => {
      if (!error || typeof error !== "object") {
        return null;
      }

      const title =
        typeof (error as { title?: unknown }).title === "string"
          ? (error as { title: string }).title
          : null;
      const detail =
        typeof (error as { detail?: unknown }).detail === "string"
          ? (error as { detail: string }).detail
          : null;

      return [title, detail].filter(Boolean).join(": ");
    })
    .filter((value): value is string => Boolean(value))
    .join(" | ");

  return message || fallbackMessage;
}

async function fetchFromMangaDex<TData>(
  path: string,
  searchParams?: SearchParams
) {
  const url = createMangaDexUrl(path, searchParams);
  let response: Response;

  try {
    response = await fetch(url, {
      headers: {
        Accept: "application/json",
      },
    });
  } catch (error) {
    const message =
      error instanceof Error
        ? `Unable to reach MangaDex: ${error.message}`
        : "Unable to reach MangaDex.";

    throw new MangaDexRequestError(message);
  }

  let payload: unknown;

  try {
    payload = await response.json();
  } catch {
    throw new MangaDexRequestError(
      `MangaDex returned an invalid JSON response with status ${response.status}.`,
      response.status
    );
  }

  if (!response.ok) {
    throw new MangaDexRequestError(
      getErrorMessage(
        payload,
        `MangaDex request failed with status ${response.status}.`
      ),
      response.status
    );
  }

  if (
    payload &&
    typeof payload === "object" &&
    "result" in payload &&
    (payload as { result?: unknown }).result === "error"
  ) {
    throw new MangaDexRequestError(
      getErrorMessage(payload, "MangaDex returned an error response."),
      response.status
    );
  }

  return payload as TData;
}

function normalizeId(value: string, label: string) {
  const normalizedValue = value.trim();

  if (!normalizedValue) {
    throw new MangaDexRequestError(`${label} is required.`);
  }

  return normalizedValue;
}

export async function getMangaList(
  options: MangaListOptions = {}
): Promise<Manga[]> {
  const result = await getMangaListPage(options);

  return result.manga;
}

export async function getMangaListPage(
  options: MangaListOptions = {}
): Promise<PaginatedMangaListResult> {
  const title = options.title?.trim();
  const genreTagId = options.genreTagId?.trim();
  const response = await fetchFromMangaDex<MangaListResponse>("/manga", {
    limit: options.limit ?? DEFAULT_MANGA_LIST_LIMIT,
    offset: options.offset ?? 0,
    title: title || undefined,
    "includedTags[]": genreTagId ? [genreTagId] : undefined,
    "includes[]": ["cover_art", "author", "artist"],
  });

  return {
    manga: response.data,
    limit: response.limit,
    offset: response.offset,
    total: response.total,
    hasMore: response.offset + response.data.length < response.total,
  };
}

export async function getGenreTags(): Promise<MangaTag[]> {
  const response = await fetchFromMangaDex<MangaTagListResponse>("/manga/tag");

  return response.data.filter((tag) => tag.attributes.group === "genre");
}

export async function getMangaById(id: string): Promise<Manga> {
  const mangaId = encodeURIComponent(normalizeId(id, "Manga ID"));
  const response = await fetchFromMangaDex<MangaResponse>(`/manga/${mangaId}`, {
    "includes[]": ["cover_art", "author", "artist"],
  });

  return response.data;
}

export async function getChapters(mangaId: string): Promise<Chapter[]> {
  const normalizedMangaId = encodeURIComponent(
    normalizeId(mangaId, "Manga ID")
  );
  const chapters: Chapter[] = [];
  let offset = 0;

  while (true) {
    const response = await fetchFromMangaDex<ChapterListResponse>(
      `/manga/${normalizedMangaId}/feed`,
      {
        limit: CHAPTERS_PAGE_LIMIT,
        offset,
        "order[volume]": "asc",
        "order[chapter]": "asc",
      }
    );

    chapters.push(...response.data);

    const nextOffset = response.offset + response.limit;

    if (response.data.length === 0 || nextOffset >= response.total) {
      break;
    }

    offset = nextOffset;
  }

  return chapters;
}

export async function getChapterById(id: string): Promise<Chapter> {
  const chapterId = encodeURIComponent(normalizeId(id, "Chapter ID"));
  const response = await fetchFromMangaDex<ChapterResponse>(
    `/chapter/${chapterId}`
  );

  return response.data;
}

export async function getChapterPages(
  chapterId: string,
  quality: ChapterImageQuality = "data"
) {
  const normalizedChapterId = encodeURIComponent(
    normalizeId(chapterId, "Chapter ID")
  );
  const response = await fetchFromMangaDex<MangaDexAtHomeResponse>(
    `/at-home/server/${normalizedChapterId}`
  );

  return response.chapter[quality].map(
    (fileName) => `${response.baseUrl}/${quality}/${response.chapter.hash}/${fileName}`
  );
}
