import { NextResponse } from "next/server";
import { getMangaListPage, MangaDexRequestError } from "@/lib/mangadex";

const DEFAULT_LIMIT = 20;
const MAX_LIMIT = 40;

function parseNumberParam(value: string | null, fallbackValue: number) {
  if (!value) {
    return fallbackValue;
  }

  const parsedValue = Number.parseInt(value, 10);

  if (!Number.isFinite(parsedValue) || parsedValue < 0) {
    return fallbackValue;
  }

  return parsedValue;
}

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const title = searchParams.get("title")?.trim() ?? "";
  const genreTagId = searchParams.get("genre")?.trim() ?? "";
  const offset = parseNumberParam(searchParams.get("offset"), 0);
  const limit = Math.min(
    parseNumberParam(searchParams.get("limit"), DEFAULT_LIMIT),
    MAX_LIMIT
  );

  try {
    const result = await getMangaListPage({
      title,
      genreTagId,
      offset,
      limit,
    });

    return NextResponse.json(
      {
        success: true,
        manga: result.manga,
        offset: result.offset,
        limit: result.limit,
        total: result.total,
        hasMore: result.hasMore,
      },
      { status: 200 }
    );
  } catch (error) {
    if (error instanceof MangaDexRequestError) {
      return NextResponse.json(
        {
          success: false,
          message: error.message || "Unable to load manga right now.",
        },
        { status: error.status || 502 }
      );
    }

    return NextResponse.json(
      {
        success: false,
        message: "Unable to load manga right now.",
      },
      { status: 500 }
    );
  }
}
