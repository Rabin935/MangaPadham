type PasswordResetEmailParams = {
  to: string;
  name: string;
  resetLink: string;
  expiresInMinutes: number;
};

export async function sendMockPasswordResetEmail({
  to,
  name,
  resetLink,
  expiresInMinutes,
}: PasswordResetEmailParams) {
  console.log("Mock password reset email:", {
    to,
    name,
    subject: "Reset your password",
    resetLink,
    expiresInMinutes,
  });

  return { success: true };
}
