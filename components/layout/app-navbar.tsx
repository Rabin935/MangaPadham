"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useAuth } from "@/components/auth/auth-provider";
import { CoinIcon } from "@/components/ui/icons";

const hiddenPrefixes = ["/login", "/signup", "/forgot-password"];

const publicLinks = [{ href: "/manga", label: "Manga" }] as const;
const authenticatedLinks = [
  { href: "/dashboard", label: "Dashboard" },
  { href: "/manga", label: "Manga" },
  { href: "/favorites", label: "Favorites" },
] as const;

function isActivePath(pathname: string, href: string) {
  if (href === "/manga") {
    return pathname.startsWith("/manga") || pathname.startsWith("/reader");
  }

  return pathname === href || pathname.startsWith(`${href}/`);
}

export function AppNavbar() {
  const pathname = usePathname();
  const { isAuthenticated, isLoading, logout, user } = useAuth();

  if (hiddenPrefixes.some((prefix) => pathname.startsWith(prefix))) {
    return null;
  }

  const links = isAuthenticated ? authenticatedLinks : publicLinks;

  return (
    <div className="sticky top-0 z-50 px-4 pt-4 sm:px-6 lg:px-8">
      <header className="mx-auto flex w-full max-w-7xl flex-col gap-4 rounded-[28px] border border-white/10 bg-[rgba(7,13,28,0.82)] px-4 py-4 shadow-[0_24px_90px_rgba(0,0,0,0.35)] backdrop-blur-xl sm:px-6 lg:flex-row lg:items-center lg:justify-between">
        <div className="flex flex-col gap-4 sm:flex-row sm:items-center">
          <Link href="/manga" className="inline-flex items-center gap-3">
            <span className="flex h-11 w-11 items-center justify-center rounded-2xl bg-cyan-300 text-sm font-bold text-slate-950">
              MP
            </span>
            <span>
              <span className="block text-sm uppercase tracking-[0.35em] text-slate-300">
                Manga Padham
              </span>
              <span className="block text-xs text-slate-500">
                Read, unlock, and keep your place
              </span>
            </span>
          </Link>

          <nav className="inline-flex flex-wrap gap-2 rounded-full border border-white/10 bg-white/5 p-1">
            {links.map((link) => {
              const active = isActivePath(pathname, link.href);

              return (
                <Link
                  key={link.href}
                  href={link.href}
                  className={`rounded-full px-4 py-2 text-sm font-medium transition ${
                    active
                      ? "bg-cyan-300 text-slate-950"
                      : "text-slate-300 hover:bg-white/10 hover:text-white"
                  }`}
                >
                  {link.label}
                </Link>
              );
            })}
          </nav>
        </div>

        <div className="flex flex-wrap items-center gap-3">
          {isAuthenticated && user ? (
            <>
              <div className="inline-flex items-center gap-2 rounded-full border border-amber-300/20 bg-amber-300/10 px-4 py-2 text-sm font-semibold text-amber-100">
                <CoinIcon className="h-4 w-4" />
                <span>{user.coins} coins</span>
              </div>
              <div className="rounded-full border border-white/10 bg-white/5 px-4 py-2 text-sm text-slate-300">
                <span className="text-slate-500">Signed in as </span>
                <span className="font-medium text-white">{user.name}</span>
              </div>
              <button
                type="button"
                onClick={() => {
                  void logout("/login");
                }}
                className="rounded-full border border-white/15 px-4 py-2 text-sm font-medium text-slate-200 transition hover:border-rose-300/40 hover:bg-rose-300/10 hover:text-rose-100"
              >
                Logout
              </button>
            </>
          ) : isLoading ? (
            <div className="rounded-full border border-white/10 bg-white/5 px-4 py-2 text-sm text-slate-400">
              Restoring session
            </div>
          ) : (
            <>
              <Link
                href="/login"
                className="rounded-full border border-white/15 px-4 py-2 text-sm font-medium text-slate-200 transition hover:border-cyan-300/40 hover:bg-white/5"
              >
                Login
              </Link>
              <Link
                href="/signup"
                className="rounded-full bg-cyan-300 px-4 py-2 text-sm font-semibold text-slate-950 transition hover:bg-cyan-200"
              >
                Create account
              </Link>
            </>
          )}
        </div>
      </header>
    </div>
  );
}
