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
  name?: string;
  email?: string;
  password?: string;
  confirmPassword?: string;
};

export default function SignupPage() {
  const router = useRouter();
  const [, startTransition] = useTransition();
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [errors, setErrors] = useState<FieldErrors>({});
  const [message, setMessage] = useState<{
    type: "success" | "error";
    text: string;
  } | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  function validate() {
    const nextErrors: FieldErrors = {};

    if (!name.trim()) {
      nextErrors.name = "Name is required.";
    }

    if (!email.trim()) {
      nextErrors.email = "Email is required.";
    } else if (!EMAIL_REGEX.test(email.trim().toLowerCase())) {
      nextErrors.email = "Enter a valid email.";
    }

    if (!password.trim()) {
      nextErrors.password = "Password is required.";
    } else if (password.length < 6) {
      nextErrors.password = "Use at least 6 characters.";
    }

    if (!confirmPassword.trim()) {
      nextErrors.confirmPassword = "Please confirm password.";
    } else if (password !== confirmPassword) {
      nextErrors.confirmPassword = "Passwords do not match.";
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
      const response = await fetch("/api/auth/signup", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          name,
          email,
          password,
        }),
      });

      const data = await readApiFeedback(response);

      if (!response.ok) {
        setMessage({
          type: "error",
          text: data.message || "Unable to create your account right now.",
        });
        return;
      }

      setMessage({
        type: "success",
        text: data.message || "Account created. Redirecting to login...",
      });

      startTransition(() => {
        router.push("/login");
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
      activePath="/signup"
      eyebrow="Create Account"
      title="Start your next reading streak in style."
      description="Set up your account to unlock chapters, save progress, and manage your coins from a single account."
      asideTitle="Build a library identity that feels made for late-night binges."
      asideCopy="Signup validates on the client, posts to your API route, and keeps the experience fast with clear feedback for both success and failure."
      footer={
        <p className="text-sm text-slate-400">
          Already have an account?{" "}
          <Link href="/login" className="font-medium text-cyan-300">
            Login here
          </Link>
          .
        </p>
      }
    >
      <form className="space-y-5" onSubmit={handleSubmit}>
        <AuthField
          id="name"
          label="Display name"
          autoComplete="name"
          placeholder="Rabin"
          value={name}
          onChange={setName}
          error={errors.name}
        />
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
          autoComplete="new-password"
          placeholder="Create a password"
          value={password}
          onChange={setPassword}
          error={errors.password}
        />
        <AuthField
          id="confirmPassword"
          label="Confirm password"
          type="password"
          autoComplete="new-password"
          placeholder="Repeat your password"
          value={confirmPassword}
          onChange={setConfirmPassword}
          error={errors.confirmPassword}
        />

        {message ? <FormMessage type={message.type} message={message.text} /> : null}

        <SubmitButton
          label="Create account"
          pendingLabel="Creating your account..."
          pending={isSubmitting}
        />
      </form>
    </AuthShell>
  );
}
