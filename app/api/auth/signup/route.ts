import { NextResponse } from "next/server";
import { connectDB } from "@/lib/db";
import User from "@/model/User";
import { hashPassword } from "@/utils/hash";

type SignupBody = {
  name?: string;
  email?: string;
  password?: string;
};

const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

function isDuplicateKeyError(error: unknown): error is { code: number } {
  return (
    typeof error === "object" &&
    error !== null &&
    "code" in error &&
    error.code === 11000
  );
}

export async function POST(request: Request) {
  try {
    const body = (await request.json()) as SignupBody;

    if (
      typeof body.name !== "string" ||
      typeof body.email !== "string" ||
      typeof body.password !== "string"
    ) {
      return NextResponse.json(
        { success: false, message: "Name, email, and password are required." },
        { status: 400 }
      );
    }

    const name = body.name.trim();
    const email = body.email.trim().toLowerCase();
    const password = body.password;

    if (!name || !email || !password.trim()) {
      return NextResponse.json(
        { success: false, message: "Name, email, and password are required." },
        { status: 400 }
      );
    }

    if (!EMAIL_REGEX.test(email)) {
      return NextResponse.json(
        { success: false, message: "Please provide a valid email address." },
        { status: 400 }
      );
    }

    if (password.length < 6) {
      return NextResponse.json(
        {
          success: false,
          message: "Password must be at least 6 characters long.",
        },
        { status: 400 }
      );
    }

    await connectDB();

    const existingUser = await User.findOne({ email });

    if (existingUser) {
      return NextResponse.json(
        { success: false, message: "User already exists." },
        { status: 409 }
      );
    }

    const hashedPassword = await hashPassword(password);

    const user = await User.create({
      name,
      email,
      password: hashedPassword,
    });

    return NextResponse.json(
      {
        success: true,
        message: "User created successfully.",
        user: {
          id: user._id,
          name: user.name,
          email: user.email,
          coins: user.coins,
          readChapters: user.readChapters ?? [],
          unlockedChapters: user.unlockedChapters ?? [],
          favoriteMangaIds: user.favoriteMangaIds ?? [],
          continueReading: user.continueReading ?? null,
          createdAt: user.createdAt.toISOString(),
        },
      },
      { status: 201 }
    );
  } catch (error) {
    if (isDuplicateKeyError(error)) {
      return NextResponse.json(
        { success: false, message: "User already exists." },
        { status: 409 }
      );
    }

    return NextResponse.json(
      { success: false, message: "Internal server error." },
      { status: 500 }
    );
  }
}
