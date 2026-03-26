export const MANGADEX_BASE_URL =
  process.env.NEXT_PUBLIC_MANGADEX_BASE_URL ?? "https://api.mangadex.org";

const DEFAULT_MANGA_LIST_LIMIT = 20;
const CHAPTERS_PAGE_LIMIT = 100;

type QueryValue = string | number | boolean;
type SearchParams = Record<
  string,
  QueryValue | QueryValue[] | null | undefined
>;

type MangaDexApiError = {
  detail?: string;
  status?: number;
  title?: string;
};

type MangaDexEntity<TAttributes> = {
  id: string;
  type: string;
  attributes: TAttributes;
  relationships: MangaDexRelationship[];
};

type MangaDexCollectionResponse<TData> = {
  result: "ok" | "error";
  response: "collection";
  data: TData[];
  limit: number;
  offset: number;
  total: number;
  errors?: MangaDexApiError[];
};

type MangaDexEntityResponse<TData> = {
  result: "ok" | "error";
  response: "entity";
  data: TData;
  errors?: MangaDexApiError[];
};

export class MangaDexRequestError extends Error {
  status?: number;

  constructor(message: string, status?: number) {
    super(message);
    this.name = "MangaDexRequestError";
    this.status = status;
  }
}

export type MangaDexLocalizedString = Record<string, string>;

export type MangaDexRelationship = {
  id: string;
  type: string;
  related?: string;
  attributes?: Record<string, unknown>;
};

export type MangaDexTag = {
  id: string;
  type: string;
  attributes?: Record<string, unknown>;
  relationships?: MangaDexRelationship[];
};

export type MangaDexMangaAttributes = {
  title: MangaDexLocalizedString;
  altTitles?: MangaDexLocalizedString[];
  description: MangaDexLocalizedString;
  originalLanguage: string;
  status: string;
  year: number | null;
  contentRating: string;
  availableTranslatedLanguages?: string[];
  latestUploadedChapter?: string | null;
  tags?: MangaDexTag[];
  createdAt: string;
  updatedAt: string;
  [key: string]: unknown;
};

export type MangaDexChapterAttributes = {
  volume: string | null;
  chapter: string | null;
  title: string | null;
  translatedLanguage: string;
  externalUrl: string | null;
  publishAt: string;
  readableAt: string;
  createdAt: string;
  updatedAt: string;
  pages: number;
  [key: string]: unknown;
};

export type MangaDexManga = MangaDexEntity<MangaDexMangaAttributes>;
export type MangaDexChapter = MangaDexEntity<MangaDexChapterAttributes>;

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

export async function getMangaList() {
  const response = await fetchFromMangaDex<MangaDexCollectionResponse<MangaDexManga>>(
    "/manga",
    {
      limit: DEFAULT_MANGA_LIST_LIMIT,
      "includes[]": ["cover_art", "author", "artist"],
    }
  );

  return response.data;
}

export async function getMangaById(id: string) {
  const mangaId = encodeURIComponent(normalizeId(id, "Manga ID"));
  const response = await fetchFromMangaDex<MangaDexEntityResponse<MangaDexManga>>(
    `/manga/${mangaId}`,
    {
      "includes[]": ["cover_art", "author", "artist"],
    }
  );

  return response.data;
}

export async function getChapters(mangaId: string) {
  const normalizedMangaId = encodeURIComponent(
    normalizeId(mangaId, "Manga ID")
  );
  const chapters: MangaDexChapter[] = [];
  let offset = 0;

  while (true) {
    const response = await fetchFromMangaDex<
      MangaDexCollectionResponse<MangaDexChapter>
    >(`/manga/${normalizedMangaId}/feed`, {
      limit: CHAPTERS_PAGE_LIMIT,
      offset,
      "order[volume]": "asc",
      "order[chapter]": "asc",
    });

    chapters.push(...response.data);

    const nextOffset = response.offset + response.limit;

    if (response.data.length === 0 || nextOffset >= response.total) {
      break;
    }

    offset = nextOffset;
  }

  return chapters;
}
