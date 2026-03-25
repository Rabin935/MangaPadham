"use client";

import { usePathname, useRouter } from "next/navigation";
import { useEffect, useTransition } from "react";
import type { ReactNode } from "react";
import { useAuth } from "@/components/auth/auth-provider";

function GuardScreen({
  title,
  description,
}: {
  title: string;
  description: string;
}) {
  return (
    <main className="flex min-h-screen items-center justify-center px-4 py-8 sm:px-6 lg:px-8">
      <div className="w-full max-w-md rounded-[28px] border border-white/10 bg-[rgba(7,13,28,0.78)] p-8 text-center shadow-[0_30px_100px_rgba(0,0,0,0.45)] backdrop-blur-xl">
        <div className="mx-auto mb-5 h-12 w-12 animate-pulse rounded-full bg-cyan-300/20" />
        <p className="text-xs uppercase tracking-[0.4em] text-cyan-300/80">
          Manga Padham
        </p>
        <h1 className="mt-4 text-2xl font-semibold text-white">{title}</h1>
        <p className="mt-3 text-sm leading-7 text-slate-300">{description}</p>
      </div>
    </main>
  );
}

export function ProtectedRoute({ children }: { children: ReactNode }) {
  const router = useRouter();
  const pathname = usePathname();
  const [, startTransition] = useTransition();
  const { isAuthenticated, isLoading } = useAuth();

  useEffect(() => {
    if (!isLoading && !isAuthenticated) {
      startTransition(() => {
        router.replace(`/login?next=${encodeURIComponent(pathname)}`);
      });
    }
  }, [isAuthenticated, isLoading, pathname, router, startTransition]);

  if (isLoading) {
    return (
      <GuardScreen
        title="Checking your session"
        description="Hold on while we verify your access and restore your reading state."
      />
    );
  }

  if (!isAuthenticated) {
    return (
      <GuardScreen
        title="Redirecting to login"
        description="This area is protected, so we're sending you back to the sign-in flow."
      />
    );
  }

  return <>{children}</>;
}

export function GuestRoute({
  children,
  redirectTo = "/dashboard",
}: {
  children: ReactNode;
  redirectTo?: string;
}) {
  const router = useRouter();
  const [, startTransition] = useTransition();
  const { isAuthenticated, isLoading } = useAuth();

  useEffect(() => {
    if (!isLoading && isAuthenticated) {
      startTransition(() => {
        router.replace(redirectTo);
      });
    }
  }, [isAuthenticated, isLoading, redirectTo, router, startTransition]);

  if (isLoading) {
    return (
      <GuardScreen
        title="Restoring your session"
        description="We're checking whether you're already logged in before showing this form."
      />
    );
  }

  if (isAuthenticated) {
    return (
      <GuardScreen
        title="Redirecting to dashboard"
        description="You're already logged in, so we're taking you to your protected area."
      />
    );
  }

  return <>{children}</>;
}
