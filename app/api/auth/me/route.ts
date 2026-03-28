import { NextResponse } from "next/server";
import { serializeAuthUser, withAuth } from "@/lib/auth";

export const GET = withAuth(async (request) => {
  return NextResponse.json(
    {
      success: true,
      user: serializeAuthUser(request.user),
    },
    { status: 200 }
  );
});
