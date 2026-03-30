import { NextResponse } from "next/server";
import { connectDB } from "@/lib/db";
import User from "@/model/User";
import type { AuthUser, ContinueReading } from "@/types/auth";
import { verifyToken } from "@/utils/token";

type RouteContext = {
  params?: Promise<Record<string, string | string[] | undefined>>;
};

export type AuthenticatedUser = {
  id: string;
  name: string;
  email: string;
  coins: number;
  lastReadAt: Date | null;
  streak: number;
  totalCoinsEarned: number;
  readChapters: string[];
  unlockedChapters: string[];
  favoriteMangaIds: string[];
  continueReading: ContinueReading | null;
  createdAt: Date;
};

export type AuthenticatedRequest = Request & {
  user: AuthenticatedUser;
};

type AuthenticatedRouteHandler<TContext = RouteContext> = (
  request: AuthenticatedRequest,
  context: TContext
) => Promise<Response> | Response;

type AuthUserSource = {
  _id: { toString(): string };
  name: string;
  email: string;
  coins?: number;
  lastReadAt?: Date | null;
  streak?: number;
  totalCoinsEarned?: number;
  readChapters?: string[];
  unlockedChapters?: string[];
  favoriteMangaIds?: string[];
  continueReading?: ContinueReading | null;
  createdAt: Date;
};

function normalizeCount(value?: number) {
  return typeof value === "number" && value >= 0 ? value : 0;
}

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

export function createAuthenticatedUser(user: AuthUserSource): AuthenticatedUser {
  return {
    id: user._id.toString(),
    name: user.name,
    email: user.email,
    coins: normalizeCount(user.coins),
    lastReadAt: user.lastReadAt ?? null,
    streak: normalizeCount(user.streak),
    totalCoinsEarned: normalizeCount(user.totalCoinsEarned),
    readChapters: Array.isArray(user.readChapters) ? user.readChapters : [],
    unlockedChapters: Array.isArray(user.unlockedChapters)
      ? user.unlockedChapters
      : [],
    favoriteMangaIds: Array.isArray(user.favoriteMangaIds)
      ? user.favoriteMangaIds
      : [],
    continueReading: user.continueReading ?? null,
    createdAt: user.createdAt,
  };
}

export function serializeAuthUser(user: AuthenticatedUser): AuthUser {
  return {
    ...user,
    lastReadAt: user.lastReadAt ? user.lastReadAt.toISOString() : null,
    createdAt: user.createdAt.toISOString(),
  };
}

export async function getAuthUserFromToken(token: string) {
  const payload = verifyToken(token);

  await connectDB();

  const user = await User.findById(payload.userId).select("-password -resetToken");

  if (!user) {
    return null;
  }

  return createAuthenticatedUser(user);
}

export async function getAuthUser(request: Request) {
  const token = getTokenFromRequest(request);

  if (!token) {
    return null;
  }

  return getAuthUserFromToken(token);
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
