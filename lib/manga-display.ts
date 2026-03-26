import type {
  CoverArtRelationship,
  LocalizedString,
  Manga,
} from "@/types/mangadex";

function isCoverArtRelationship(
  relationship: Manga["relationships"][number]
): relationship is CoverArtRelationship {
  return (
    relationship.type === "cover_art" &&
    typeof relationship.attributes === "object" &&
    relationship.attributes !== null &&
    "fileName" in relationship.attributes &&
    typeof relationship.attributes.fileName === "string"
  );
}

export function getLocalizedText(
  values: LocalizedString | undefined,
  fallback: string
) {
  if (!values) {
    return fallback;
  }

  return (
    values.en ??
    values["ja-ro"] ??
    values.ja ??
    Object.values(values)[0] ??
    fallback
  );
}

export function getMangaTitle(manga: Manga) {
  return getLocalizedText(manga.attributes.title, "Untitled manga");
}

export function getMangaDescription(manga: Manga) {
  return getLocalizedText(
    manga.attributes.description,
    "No description is available for this manga yet."
  );
}

export function getCoverImageUrl(manga: Manga, size: "256" | "512" = "256") {
  const coverArt = manga.relationships.find(isCoverArtRelationship);

  if (!coverArt?.attributes?.fileName) {
    return null;
  }

  return `https://uploads.mangadex.org/covers/${manga.id}/${coverArt.attributes.fileName}.${size}.jpg`;
}

export function getGenreLabels(manga: Manga) {
  return manga.attributes.tags
    .filter((tag) => tag.attributes.group === "genre")
    .map((tag) => getLocalizedText(tag.attributes.name, "Unknown genre"));
}

export function getTagLabels(manga: Manga) {
  return manga.attributes.tags.map((tag) =>
    getLocalizedText(tag.attributes.name, "Unknown tag")
  );
}
