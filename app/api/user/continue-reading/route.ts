import { NextResponse } from "next/server";
import { getChapterMangaId, getChapterNumberLabel, getChapterTitle } from "@/lib/chapter-display";
import { withAuth } from "@/lib/auth";
import { connectDB } from "@/lib/db";
import { getChapterById, getMangaById, MangaDexRequestError } from "@/lib/mangadex";
import { getMangaTitle } from "@/lib/manga-display";
import User from "@/model/User";

type ContinueReadingBody = {
  chapterId?: string;
};

export const POST = withAuth(async (request) => {
  try {
    const body = (await request.json()) as ContinueReadingBody;

    if (typeof body.chapterId !== "string" || !body.chapterId.trim()) {
      return NextResponse.json(
        { success: false, message: "Chapter ID is required." },
        { status: 400 }
      );
    }

    const chapter = await getChapterById(body.chapterId);
    const mangaId = getChapterMangaId(chapter);

    if (!mangaId) {
      return NextResponse.json(
        { success: false, message: "Unable to determine the manga for this chapter." },
        { status: 400 }
      );
    }

    const manga = await getMangaById(mangaId);

    await connectDB();

    const continueReading = {
      mangaId,
      mangaTitle: getMangaTitle(manga),
      chapterId: chapter.id,
      chapterNumber: getChapterNumberLabel(chapter),
      chapterTitle: getChapterTitle(chapter),
    };
    const lastReadAt = new Date();

    const updatedUser = await User.findByIdAndUpdate(
      request.user.id,
      {
        $set: {
          continueReading,
          lastReadAt,
        },
        $addToSet: {
          readChapters: chapter.id,
        },
      },
      {
        new: true,
        select: "continueReading readChapters lastReadAt",
      }
    );

    return NextResponse.json(
      {
        success: true,
        continueReading: updatedUser?.continueReading ?? continueReading,
        readChapters: updatedUser?.readChapters ?? [chapter.id],
        lastReadAt: updatedUser?.lastReadAt?.toISOString() ?? lastReadAt.toISOString(),
      },
      { status: 200 }
    );
  } catch (error) {
    if (error instanceof MangaDexRequestError) {
      return NextResponse.json(
        {
          success: false,
          message: error.message || "Unable to save reading progress right now.",
        },
        { status: error.status || 502 }
      );
    }

    return NextResponse.json(
      { success: false, message: "Unable to save reading progress right now." },
      { status: 500 }
    );
  }
});
