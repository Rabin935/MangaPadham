import { NextResponse } from "next/server";
import { withAuth } from "@/lib/auth";
import { connectDB } from "@/lib/db";
import User from "@/model/User";

type FavoriteBody = {
  mangaId?: string;
};

export const GET = withAuth(async (request) => {
  return NextResponse.json(
    {
      success: true,
      favoriteMangaIds: request.user.favoriteMangaIds,
    },
    { status: 200 }
  );
});

export const POST = withAuth(async (request) => {
  try {
    const body = (await request.json()) as FavoriteBody;

    if (typeof body.mangaId !== "string" || !body.mangaId.trim()) {
      return NextResponse.json(
        { success: false, message: "Manga ID is required." },
        { status: 400 }
      );
    }

    const mangaId = body.mangaId.trim();
    const isFavorite = request.user.favoriteMangaIds.includes(mangaId);

    await connectDB();

    if (isFavorite) {
      const updatedUser = await User.findByIdAndUpdate(
        request.user.id,
        {
          $pull: {
            favoriteMangaIds: mangaId,
          },
        },
        {
          new: true,
          select: "favoriteMangaIds",
        }
      );

      return NextResponse.json(
        {
          success: true,
          isFavorite: false,
          favoriteMangaIds: updatedUser?.favoriteMangaIds ?? [],
        },
        { status: 200 }
      );
    }

    const updatedUser = await User.findByIdAndUpdate(
      request.user.id,
      {
        $addToSet: {
          favoriteMangaIds: mangaId,
        },
      },
      {
        new: true,
        select: "favoriteMangaIds",
      }
    );

    return NextResponse.json(
      {
        success: true,
        isFavorite: true,
        favoriteMangaIds: updatedUser?.favoriteMangaIds ?? [mangaId],
      },
      { status: 200 }
    );
  } catch {
    return NextResponse.json(
      { success: false, message: "Unable to update favorites right now." },
      { status: 500 }
    );
  }
});
