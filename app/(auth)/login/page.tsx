"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { FormEvent, useState, useTransition } from "react";
import {
  AuthField,
  AuthShell,
  FormMessage,
  SubmitButton,
} from "../_components/auth-ui";
import { EMAIL_REGEX, readApiFeedback } from "../_components/auth-utils";

type FieldErrors = {
  email?: string;
  password?: string;
};

export default function LoginPage() {
  const router = useRouter();
  const [, startTransition] = useTransition();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
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

    if (!password.trim()) {
      nextErrors.password = "Password is required.";
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
      const response = await fetch("/api/auth/login", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        credentials: "include",
        body: JSON.stringify({
          email,
          password,
        }),
      });

      const data = await readApiFeedback(response);

      if (!response.ok) {
        setMessage({
          type: "error",
          text: data.message || "Unable to login. Please try again.",
        });
        return;
      }

      setMessage({
        type: "success",
        text: data.message || "Login successful. Redirecting to home...",
      });

      startTransition(() => {
        router.push("/");
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
    <AuthShell
      activePath="/login"
      eyebrow="Welcome Back"
      title="Step back into your reading vault."
      description="Use your email and password to continue where you left off. Your session token will be stored automatically after a successful login."
      asideTitle="Return to your unlocked chapters and saved progress."
      asideCopy="The login flow talks directly to your API route, stores the JWT cookie, and gives instant feedback without breaking the mood of the page."
      footer={
        <p className="text-sm text-slate-400">
          New here?{" "}
          <Link href="/signup" className="font-medium text-cyan-300">
            Create an account
          </Link>
          {" "}or{" "}
          <Link href="/forgot-password" className="font-medium text-amber-300">
            recover your password
          </Link>
          .
        </p>
      }
    >
      <form className="space-y-5" onSubmit={handleSubmit}>
        <AuthField
          id="email"
          label="Email"
          type="email"
          autoComplete="email"
          placeholder="you@example.com"
          value={email}
          onChange={setEmail}
          error={errors.email}
        />
        <AuthField
          id="password"
          label="Password"
          type="password"
          autoComplete="current-password"
          placeholder="Enter your password"
          value={password}
          onChange={setPassword}
          error={errors.password}
        />

        {message ? <FormMessage type={message.type} message={message.text} /> : null}

        <SubmitButton
          label="Enter Manga Padham"
          pendingLabel="Signing you in..."
          pending={isSubmitting}
        />
      </form>
    </AuthShell>
  );
}
