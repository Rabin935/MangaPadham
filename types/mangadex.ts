export interface LocalizedString {
  [languageCode: string]: string;
}

export interface MangaDexError {
  id?: string;
  status?: number;
  title?: string;
  detail?: string;
}

export interface MangaDexRelationship<TAttributes = unknown> {
  id: string;
  type: string;
  related?: string;
  attributes?: TAttributes;
}

export interface MangaDexEntity<
  TType extends string,
  TAttributes,
  TRelationship extends MangaDexRelationship = MangaDexRelationship,
> {
  id: string;
  type: TType;
  attributes: TAttributes;
  relationships: TRelationship[];
}

export interface MangaDexCollectionResponse<TData> {
  result: "ok" | "error";
  response: "collection";
  data: TData[];
  limit: number;
  offset: number;
  total: number;
  errors?: MangaDexError[];
}

export interface MangaDexEntityResponse<TData> {
  result: "ok" | "error";
  response: "entity";
  data: TData;
  errors?: MangaDexError[];
}

export interface MangaDexAtHomeChapter {
  hash: string;
  data: string[];
  dataSaver: string[];
}

export interface MangaDexAtHomeResponse {
  result: "ok" | "error";
  baseUrl: string;
  chapter: MangaDexAtHomeChapter;
  errors?: MangaDexError[];
}

export interface CoverArtAttributes {
  description: string;
  volume: string | null;
  fileName: string;
  locale: string | null;
  createdAt: string;
  updatedAt: string;
  version: number;
}

export interface CoverArtRelationship
  extends MangaDexRelationship<CoverArtAttributes> {
  type: "cover_art";
}

export type CoverArt = MangaDexEntity<"cover_art", CoverArtAttributes>;

export interface MangaTagAttributes {
  name: LocalizedString;
  description: string;
  group: string;
  version: number;
}

export type MangaTag = MangaDexEntity<"tag", MangaTagAttributes>;

export type MangaRelationship = CoverArtRelationship | MangaDexRelationship;

export interface MangaAttributes {
  title: LocalizedString;
  altTitles: LocalizedString[];
  description: LocalizedString;
  isLocked: boolean;
  links?: Record<string, string>;
  officialLinks?: Record<string, string> | null;
  originalLanguage: string;
  lastVolume: string | null;
  lastChapter: string | null;
  publicationDemographic: string | null;
  status: string;
  year: number | null;
  contentRating: string;
  tags: MangaTag[];
  state: string;
  chapterNumbersResetOnNewVolume: boolean;
  createdAt: string;
  updatedAt: string;
  version: number;
  availableTranslatedLanguages: string[];
  latestUploadedChapter: string | null;
}

export type Manga = MangaDexEntity<"manga", MangaAttributes, MangaRelationship>;

export interface ChapterAttributes {
  volume: string | null;
  chapter: string | null;
  title: string | null;
  translatedLanguage: string;
  externalUrl: string | null;
  isUnavailable: boolean;
  publishAt: string;
  readableAt: string;
  createdAt: string;
  updatedAt: string;
  version: number;
  pages: number;
}

export type Chapter = MangaDexEntity<"chapter", ChapterAttributes>;

export type MangaListResponse = MangaDexCollectionResponse<Manga>;
export type MangaResponse = MangaDexEntityResponse<Manga>;
export type MangaTagListResponse = MangaDexCollectionResponse<MangaTag>;
export type ChapterListResponse = MangaDexCollectionResponse<Chapter>;
export type ChapterResponse = MangaDexEntityResponse<Chapter>;
