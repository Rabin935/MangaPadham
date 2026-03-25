import { NextResponse } from "next/server";
import { connectDB } from "@/lib/db";
import User from "@/model/User";
import { verifyToken } from "@/utils/token";

type RouteContext = {
  params?: Promise<Record<string, string | string[] | undefined>>;
};

export type AuthenticatedUser = {
  id: string;
  name: string;
  email: string;
  coins: number;
  readChapters: string[];
  unlockedChapters: string[];
  createdAt: Date;
};

export type AuthenticatedRequest = Request & {
  user: AuthenticatedUser;
};

type AuthenticatedRouteHandler<TContext = RouteContext> = (
  request: AuthenticatedRequest,
  context: TContext
) => Promise<Response> | Response;

function getTokenFromCookieHeader(cookieHeader: string) {
  const cookies = cookieHeader.split(";");

  for (const cookie of cookies) {
    const [rawName, ...rawValueParts] = cookie.trim().split("=");

    if (rawName === "token") {
      return rawValueParts.join("=");
    }
  }

  return null;
}

export function getTokenFromRequest(request: Request) {
  const authHeader = request.headers.get("authorization");

  if (authHeader?.startsWith("Bearer ")) {
    return authHeader.slice(7).trim();
  }

  const cookieHeader = request.headers.get("cookie");

  if (!cookieHeader) {
    return null;
  }

  return getTokenFromCookieHeader(cookieHeader);
}

function createUnauthorizedResponse(message = "Unauthorized.") {
  return NextResponse.json(
    {
      success: false,
      message,
    },
    { status: 401 }
  );
}

function sanitizeUser(user: {
  _id: { toString(): string };
  name: string;
  email: string;
  coins: number;
  readChapters: string[];
  unlockedChapters: string[];
  createdAt: Date;
}) {
  return {
    id: user._id.toString(),
    name: user.name,
    email: user.email,
    coins: user.coins,
    readChapters: user.readChapters,
    unlockedChapters: user.unlockedChapters,
    createdAt: user.createdAt,
  };
}

export async function getAuthUser(request: Request) {
  const token = getTokenFromRequest(request);

  if (!token) {
    return null;
  }

  const payload = verifyToken(token);

  await connectDB();

  const user = await User.findById(payload.userId).select("-password -resetToken");

  if (!user) {
    return null;
  }

  return sanitizeUser(user);
}

export function withAuth<TContext = RouteContext>(
  handler: AuthenticatedRouteHandler<TContext>
) {
  return async function protectedRoute(request: Request, context: TContext) {
    try {
      const user = await getAuthUser(request);

      if (!user) {
        return createUnauthorizedResponse("Unauthorized access.");
      }

      const authenticatedRequest = request as AuthenticatedRequest;
      authenticatedRequest.user = user;

      return handler(authenticatedRequest, context);
    } catch {
      return createUnauthorizedResponse("Invalid or expired token.");
    }
  };
}
