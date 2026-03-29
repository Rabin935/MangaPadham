import { NextResponse } from "next/server";
import { withAuth } from "@/lib/auth";
import { connectDB } from "@/lib/db";
import { getChapterById, MangaDexRequestError } from "@/lib/mangadex";
import User from "@/model/User";

type EarnCoinsBody = {
  chapterId?: string;
};

export const POST = withAuth(async (request) => {
  try {
    const body = (await request.json()) as EarnCoinsBody;

    if (typeof body.chapterId !== "string" || !body.chapterId.trim()) {
      return NextResponse.json(
        { success: false, message: "Chapter ID is required." },
        { status: 400 }
      );
    }

    const chapterId = body.chapterId.trim();

    await getChapterById(chapterId);
    await connectDB();

    const updatedUser = await User.findOneAndUpdate(
      {
        _id: request.user.id,
        earnedCoinChapterIds: {
          $ne: chapterId,
        },
      },
      {
        $addToSet: {
          earnedCoinChapterIds: chapterId,
        },
        $inc: {
          coins: 1,
          totalCoinsEarned: 1,
        },
      },
      {
        new: true,
        select: "coins totalCoinsEarned",
      }
    );

    if (updatedUser) {
      return NextResponse.json(
        {
          success: true,
          earned: true,
          coins: updatedUser.coins,
          totalCoinsEarned: updatedUser.totalCoinsEarned,
        },
        { status: 200 }
      );
    }

    const currentUser = await User.findById(request.user.id).select(
      "coins totalCoinsEarned"
    );

    if (!currentUser) {
      return NextResponse.json(
        { success: false, message: "User not found." },
        { status: 404 }
      );
    }

    return NextResponse.json(
      {
        success: true,
        earned: false,
        coins: currentUser.coins,
        totalCoinsEarned: currentUser.totalCoinsEarned,
      },
      { status: 200 }
    );
  } catch (error) {
    if (error instanceof MangaDexRequestError) {
      return NextResponse.json(
        {
          success: false,
          message: error.message || "Unable to award coins right now.",
        },
        { status: error.status || 502 }
      );
    }

    return NextResponse.json(
      { success: false, message: "Unable to award coins right now." },
      { status: 500 }
    );
  }
});
