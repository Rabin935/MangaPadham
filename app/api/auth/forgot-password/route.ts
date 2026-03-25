import crypto from "node:crypto";
import { NextResponse } from "next/server";
import { connectDB } from "@/lib/db";
import { sendMockPasswordResetEmail } from "@/lib/mail";
import User from "@/model/User";

type ForgotPasswordBody = {
  email?: string;
};

const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
const RESET_TOKEN_EXPIRY_MS = 15 * 60 * 1000;
const RESET_TOKEN_EXPIRY_MINUTES = 15;

export async function POST(request: Request) {
  try {
    const body = (await request.json()) as ForgotPasswordBody;

    if (typeof body.email !== "string") {
      return NextResponse.json(
        { success: false, message: "Email is required." },
        { status: 400 }
      );
    }

    const email = body.email.trim().toLowerCase();

    if (!email) {
      return NextResponse.json(
        { success: false, message: "Email is required." },
        { status: 400 }
      );
    }

    if (!EMAIL_REGEX.test(email)) {
      return NextResponse.json(
        { success: false, message: "Please provide a valid email address." },
        { status: 400 }
      );
    }

    await connectDB();

    const user = await User.findOne({ email });

    if (user) {
      const rawResetToken = crypto.randomBytes(32).toString("hex");
      const hashedResetToken = crypto
        .createHash("sha256")
        .update(rawResetToken)
        .digest("hex");

      user.resetToken = hashedResetToken;
      user.resetTokenExpiry = new Date(Date.now() + RESET_TOKEN_EXPIRY_MS);

      await user.save();

      const appUrl = process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000";
      const resetLink = `${appUrl}/reset-password?token=${rawResetToken}`;

      await sendMockPasswordResetEmail({
        to: user.email,
        name: user.name,
        resetLink,
        expiresInMinutes: RESET_TOKEN_EXPIRY_MINUTES,
      });
    }

    return NextResponse.json(
      {
        success: true,
        message: "If an account with that email exists, a reset link has been sent.",
      },
      { status: 200 }
    );
  } catch {
    return NextResponse.json(
      { success: false, message: "Internal server error." },
      { status: 500 }
    );
  }
}
