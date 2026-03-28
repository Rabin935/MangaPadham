import nodemailer from "nodemailer";
import { getMailConfig } from "@/lib/env";

type PasswordResetEmailParams = {
  to: string;
  name: string;
  resetLink: string;
  expiresInMinutes: number;
};

const { user, pass } = getMailConfig();

const transporter = nodemailer.createTransport({
  service: "gmail",
  auth: {
    user,
    pass,
  },
});

export async function sendPasswordResetEmail({
  to,
  name,
  resetLink,
  expiresInMinutes,
}: PasswordResetEmailParams) {
  const subject = "Reset your Manga Padham password";
  const text = [
    `Hi ${name},`,
    "",
    "We received a request to reset your password.",
    `Use this link within ${expiresInMinutes} minutes:`,
    resetLink,
    "",
    "If you did not request this, you can ignore this email.",
  ].join("\n");

  const html = `
    <div style="font-family: Arial, sans-serif; line-height: 1.6; color: #0f172a;">
      <p>Hi ${name},</p>
      <p>We received a request to reset your Manga Padham password.</p>
      <p>
        Use the link below within <strong>${expiresInMinutes} minutes</strong>:
      </p>
      <p>
        <a href="${resetLink}">${resetLink}</a>
      </p>
      <p>If you did not request this, you can safely ignore this email.</p>
    </div>
  `;

  await transporter.sendMail({
    from: `"Manga Padham" <${user}>`,
    to,
    subject,
    text,
    html,
  });

  return { success: true };
}
