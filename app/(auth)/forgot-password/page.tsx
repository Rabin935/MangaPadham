"use client";

import Link from "next/link";
import { FormEvent, useState } from "react";
import { GuestRoute } from "@/components/auth/auth-guard";
import {
  AuthField,
  AuthShell,
  FormMessage,
  SubmitButton,
} from "../_components/auth-ui";
import { EMAIL_REGEX, readApiFeedback } from "../_components/auth-utils";

type FieldErrors = {
  email?: string;
};

export default function ForgotPasswordPage() {
  const [email, setEmail] = useState("");
  const [errors, setErrors] = useState<FieldErrors>({});
  const [message, setMessage] = useState<{
    type: "success" | "error";
    text: string;
  } | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  function validate() {
    const nextErrors: FieldErrors = {};

    if (!email.trim()) {
      nextErrors.email = "Email is required.";
    } else if (!EMAIL_REGEX.test(email.trim().toLowerCase())) {
      nextErrors.email = "Enter a valid email.";
    }

    setErrors(nextErrors);
    return Object.keys(nextErrors).length === 0;
  }

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setMessage(null);

    if (!validate()) {
      return;
    }

    setIsSubmitting(true);

    try {
      const response = await fetch("/api/auth/forgot-password", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          email,
        }),
      });

      const data = await readApiFeedback(response);

      if (!response.ok) {
        setMessage({
          type: "error",
          text: data.message || "Unable to start password recovery.",
        });
        return;
      }

      setMessage({
        type: "success",
        text:
          data.message ||
          "If the account exists, a reset link has been generated. In development, check the server log for the mock email link.",
      });
    } catch {
      setMessage({
        type: "error",
        text: "Something went wrong while contacting the server.",
      });
    } finally {
      setIsSubmitting(false);
    }
  }

  return (
    <GuestRoute>
      <AuthShell
        activePath="/forgot-password"
        eyebrow="Recover Access"
        title="Reset your password without losing the mood."
        description="Enter your email to request a reset link. Recovery tokens expire after fifteen minutes and are mocked to the server log in this setup."
        asideTitle="A calmer recovery experience with the same visual identity."
        asideCopy="The page validates your email instantly, talks to the forgot-password API route, and keeps the response generic to avoid exposing whether an account exists."
        footer={
          <p className="text-sm text-slate-400">
            Remembered it again?{" "}
            <Link href="/login" className="font-medium text-cyan-300">
              Return to login
            </Link>
            {" "}or{" "}
            <Link href="/signup" className="font-medium text-amber-300">
              create a new account
            </Link>
            .
          </p>
        }
      >
        <form className="space-y-5" onSubmit={handleSubmit}>
          <AuthField
            id="email"
            label="Account email"
            type="email"
            autoComplete="email"
            placeholder="you@example.com"
            value={email}
            onChange={setEmail}
            error={errors.email}
          />

          {message ? <FormMessage type={message.type} message={message.text} /> : null}

          <SubmitButton
            label="Send reset link"
            pendingLabel="Generating reset link..."
            pending={isSubmitting}
          />
        </form>
      </AuthShell>
    </GuestRoute>
  );
}
