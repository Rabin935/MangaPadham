import { NextResponse } from "next/server";
import { withAuth } from "@/lib/auth";
import {
  CHAPTER_UNLOCK_PRICE,
  getChapterAccessState,
} from "@/lib/chapter-access";
import { connectDB } from "@/lib/db";
import { getChapterById, MangaDexRequestError } from "@/lib/mangadex";
import User from "@/model/User";

type UnlockChapterBody = {
  chapterId?: string;
};

export const POST = withAuth(async (request) => {
  try {
    const body = (await request.json()) as UnlockChapterBody;

    if (typeof body.chapterId !== "string" || !body.chapterId.trim()) {
      return NextResponse.json(
        { success: false, message: "Chapter ID is required." },
        { status: 400 }
      );
    }

    const chapterId = body.chapterId.trim();
    const chapter = await getChapterById(chapterId);
    const accessState = getChapterAccessState(
      chapter,
      request.user.unlockedChapters
    );

    if (!accessState.requiresUnlock) {
      return NextResponse.json(
        {
          success: true,
          unlocked: false,
          coins: request.user.coins,
          unlockedChapters: request.user.unlockedChapters,
          message: accessState.isFree
            ? "This chapter is already free to read."
            : "This chapter is already unlocked.",
        },
        { status: 200 }
      );
    }

    await connectDB();

    const updatedUser = await User.findOneAndUpdate(
      {
        _id: request.user.id,
        coins: {
          $gte: CHAPTER_UNLOCK_PRICE,
        },
        unlockedChapters: {
          $ne: chapterId,
        },
      },
      {
        $addToSet: {
          unlockedChapters: chapterId,
        },
        $inc: {
          coins: -CHAPTER_UNLOCK_PRICE,
        },
      },
      {
        new: true,
        select: "coins unlockedChapters",
      }
    );

    if (updatedUser) {
      return NextResponse.json(
        {
          success: true,
          unlocked: true,
          coins: updatedUser.coins,
          unlockedChapters: updatedUser.unlockedChapters,
          message: "Chapter unlocked successfully.",
        },
        { status: 200 }
      );
    }

    const currentUser = await User.findById(request.user.id).select(
      "coins unlockedChapters"
    );

    if (!currentUser) {
      return NextResponse.json(
        { success: false, message: "User not found." },
        { status: 404 }
      );
    }

    if (currentUser.unlockedChapters.includes(chapterId)) {
      return NextResponse.json(
        {
          success: true,
          unlocked: false,
          coins: currentUser.coins,
          unlockedChapters: currentUser.unlockedChapters,
          message: "This chapter is already unlocked.",
        },
        { status: 200 }
      );
    }

    return NextResponse.json(
      {
        success: false,
        message: `You need ${CHAPTER_UNLOCK_PRICE} coins to unlock this chapter.`,
        coins: currentUser.coins,
        unlockedChapters: currentUser.unlockedChapters,
      },
      { status: 400 }
    );
  } catch (error) {
    if (error instanceof MangaDexRequestError) {
      return NextResponse.json(
        {
          success: false,
          message: error.message || "Unable to unlock this chapter right now.",
        },
        { status: error.status || 502 }
      );
    }

    return NextResponse.json(
      { success: false, message: "Unable to unlock this chapter right now." },
      { status: 500 }
    );
  }
});
