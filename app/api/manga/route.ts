import { NextResponse } from "next/server";
import { getMangaList, MangaDexRequestError } from "@/lib/mangadex";

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const title = searchParams.get("title")?.trim() ?? "";
  const genreTagId = searchParams.get("genre")?.trim() ?? "";

  try {
    const manga = await getMangaList({
      title,
      genreTagId,
    });

    return NextResponse.json(
      {
        success: true,
        manga,
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
