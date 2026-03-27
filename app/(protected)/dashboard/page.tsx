"use client";

import Link from "next/link";
import { useAuth } from "@/components/auth/auth-provider";
import { ContinueReadingCard } from "@/components/reader/continue-reading-card";

export default function DashboardPage() {
  const { user, logout } = useAuth();

  if (!user) {
    return null;
  }

  const stats = [
    { label: "Coins", value: user.coins.toString().padStart(2, "0") },
    { label: "Read chapters", value: user.readChapters.length.toString() },
    {
      label: "Unlocked chapters",
      value: user.unlockedChapters.length.toString(),
    },
  ];

  return (
    <main className="relative isolate min-h-screen overflow-hidden px-4 py-8 sm:px-6 lg:px-8">
      <div className="pointer-events-none absolute inset-0">
        <div className="absolute left-[-10%] top-8 h-80 w-80 rounded-full bg-cyan-400/16 blur-3xl" />
        <div className="absolute bottom-[-12%] right-[-8%] h-96 w-96 rounded-full bg-amber-400/10 blur-3xl" />
      </div>

      <div className="relative mx-auto flex min-h-[calc(100vh-4rem)] w-full max-w-6xl flex-col justify-between rounded-[32px] border border-white/10 bg-[rgba(7,13,28,0.78)] px-6 py-8 shadow-[0_40px_140px_rgba(0,0,0,0.55)] backdrop-blur-xl sm:px-10 sm:py-10">
        <header className="flex flex-col gap-6 border-b border-white/10 pb-8 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <p className="text-xs uppercase tracking-[0.45em] text-cyan-300/80">
              Protected Dashboard
            </p>
            <h1 className="mt-3 text-4xl font-semibold tracking-tight text-white sm:text-5xl">
              Welcome back, {user.name}.
            </h1>
            <p className="mt-3 max-w-2xl text-base leading-8 text-slate-300">
              Your auth context is active, the JWT session is persisted in an
              `httpOnly` cookie, and this route is guarded by both proxy
              redirects and a client-side auth check.
            </p>
          </div>

          <div className="flex flex-wrap gap-3">
            <Link
              href="/"
              className="rounded-full border border-white/15 px-5 py-2.5 text-sm font-medium text-slate-200 transition hover:border-cyan-300/40 hover:bg-white/5"
            >
              Back home
            </Link>
            <Link
              href="/manga"
              className="rounded-full bg-cyan-300 px-5 py-2.5 text-sm font-semibold text-slate-950 transition hover:bg-cyan-200"
            >
              Browse manga
            </Link>
            <button
              type="button"
              onClick={() => {
                void logout("/login");
              }}
              className="rounded-full bg-rose-300 px-5 py-2.5 text-sm font-semibold text-slate-950 transition hover:bg-rose-200"
            >
              Logout
            </button>
          </div>
        </header>

        <section className="grid gap-6 py-12">
          <ContinueReadingCard continueReading={user.continueReading} />
        </section>

        <section className="grid gap-6 pb-2 lg:grid-cols-[1fr_0.8fr]">
          <div className="rounded-[28px] border border-white/10 bg-white/5 p-6">
            <p className="text-xs uppercase tracking-[0.35em] text-slate-500">
              Account
            </p>
            <div className="mt-5 grid gap-4 sm:grid-cols-2">
              <div className="rounded-[22px] border border-white/10 bg-[rgba(8,14,32,0.75)] p-4">
                <p className="text-sm text-slate-400">Email</p>
                <p className="mt-2 text-base font-medium text-white">
                  {user.email}
                </p>
              </div>
              <div className="rounded-[22px] border border-white/10 bg-[rgba(8,14,32,0.75)] p-4">
                <p className="text-sm text-slate-400">Joined</p>
                <p className="mt-2 text-base font-medium text-white">
                  {new Date(user.createdAt).toLocaleDateString()}
                </p>
              </div>
            </div>
          </div>

          <div className="grid gap-4">
            {stats.map((stat) => (
              <div
                key={stat.label}
                className="rounded-[24px] border border-white/10 bg-white/5 p-5"
              >
                <p className="text-xs uppercase tracking-[0.35em] text-slate-500">
                  {stat.label}
                </p>
                <p className="mt-3 text-3xl font-semibold text-white">
                  {stat.value}
                </p>
              </div>
            ))}
          </div>
        </section>
      </div>
    </main>
  );
}
