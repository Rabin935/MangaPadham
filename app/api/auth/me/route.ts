import { NextResponse } from "next/server";
import { withAuth } from "@/lib/auth";

export const GET = withAuth(async (request) => {
  return NextResponse.json(
    {
      success: true,
      user: {
        ...request.user,
        createdAt: request.user.createdAt.toISOString(),
      },
    },
    { status: 200 }
  );
});
