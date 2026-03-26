"use client";

import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { FormEvent, Suspense, useState, useTransition } from "react";
import { GuestRoute } from "@/components/auth/auth-guard";
import { useAuth } from "@/components/auth/auth-provider";
import {
  AuthField,
  AuthShell,
  FormMessage,
  SubmitButton,
} from "../_components/auth-ui";
import { EMAIL_REGEX } from "../_components/auth-utils";

type FieldErrors = {
  email?: string;
  password?: string;
};

function LoginPageContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [, startTransition] = useTransition();
  const { login } = useAuth();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [errors, setErrors] = useState<FieldErrors>({});
  const [message, setMessage] = useState<{
    type: "success" | "error";
    text: string;
  } | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const redirectTo = searchParams.get("next") || "/dashboard";

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
      const result = await login({
        email,
        password,
      });

      if (!result.success) {
        setMessage({
          type: "error",
          text: result.message,
        });
        return;
      }

      setMessage({
        type: "success",
        text: result.message || "Login successful. Redirecting to dashboard...",
      });

      startTransition(() => {
        router.push(redirectTo);
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
    <GuestRoute redirectTo={redirectTo}>
      <AuthShell
        activePath="/login"
        eyebrow="Welcome Back"
        title="Step back into your reading vault."
        description="Sign in to continue your manga journey, revisit your saved series, and jump straight back into the chapters you were enjoying."
        asideTitle="Return to your unlocked chapters and saved progress."
        asideCopy="Your shelf is waiting with ongoing story arcs, bookmarked moments, and all the late-night reading energy you left behind."
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
    </GuestRoute>
  );
}

function LoginPageFallback() {
  return (
    <main className="flex min-h-screen items-center justify-center px-4 py-8 sm:px-6 lg:px-8">
      <div className="w-full max-w-md rounded-[28px] border border-white/10 bg-[rgba(7,13,28,0.78)] p-8 text-center shadow-[0_30px_100px_rgba(0,0,0,0.45)] backdrop-blur-xl">
        <div className="mx-auto mb-5 h-12 w-12 animate-pulse rounded-full bg-cyan-300/20" />
        <p className="text-xs uppercase tracking-[0.4em] text-cyan-300/80">
          Manga Padham
        </p>
        <h1 className="mt-4 text-2xl font-semibold text-white">
          Loading login
        </h1>
        <p className="mt-3 text-sm leading-7 text-slate-300">
          Opening the gate back to your manga shelf and getting your next read
          ready.
        </p>
      </div>
    </main>
  );
}

export default function LoginPage() {
  return (
    <Suspense fallback={<LoginPageFallback />}>
      <LoginPageContent />
    </Suspense>
  );
}
