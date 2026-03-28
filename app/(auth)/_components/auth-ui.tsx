import Link from "next/link";
import { ReactNode } from "react";

type AuthShellProps = {
  activePath: "/login" | "/signup" | "/forgot-password";
  eyebrow: string;
  title: string;
  description: string;
  asideTitle: string;
  asideCopy: string;
  children: ReactNode;
  footer: ReactNode;
};

type AuthFieldProps = {
  id: string;
  label: string;
  type?: string;
  autoComplete?: string;
  placeholder: string;
  value: string;
  onChange: (value: string) => void;
  error?: string;
};

type FormMessageProps = {
  type: "success" | "error";
  message: string;
};

type SubmitButtonProps = {
  label: string;
  pendingLabel: string;
  pending: boolean;
};

const links = [
  { href: "/login", label: "Login" },
  { href: "/signup", label: "Signup" },
  { href: "/forgot-password", label: "Recover" },
] as const;

export function AuthShell({
  activePath,
  eyebrow,
  title,
  description,
  asideTitle,
  asideCopy,
  children,
  footer,
}: AuthShellProps) {
  return (
    <main className="relative isolate min-h-screen overflow-hidden px-4 py-8 sm:px-6 lg:px-8">
      <div className="pointer-events-none absolute inset-0">
        <div className="absolute left-[-12%] top-0 h-80 w-80 rounded-full bg-cyan-400/18 blur-3xl" />
        <div className="absolute right-[-6%] top-24 h-72 w-72 rounded-full bg-amber-400/12 blur-3xl" />
        <div className="absolute bottom-[-10%] left-1/3 h-72 w-72 rounded-full bg-sky-500/10 blur-3xl" />
      </div>

      <div className="relative mx-auto grid min-h-[calc(100vh-4rem)] w-full max-w-6xl overflow-hidden rounded-[32px] border border-white/10 bg-[rgba(7,13,28,0.78)] shadow-[0_40px_140px_rgba(0,0,0,0.55)] backdrop-blur-xl xl:grid-cols-[1.05fr_0.95fr]">
        <section className="hidden border-r border-white/10 bg-[linear-gradient(180deg,rgba(12,19,38,0.92),rgba(7,13,28,0.55))] p-10 xl:flex xl:flex-col xl:justify-between">
          <div>
            <Link href="/" className="inline-flex items-center gap-3">
              <span className="flex h-10 w-10 items-center justify-center rounded-2xl bg-cyan-300 text-sm font-bold text-slate-950">
                MP
              </span>
              <span className="text-sm uppercase tracking-[0.35em] text-slate-300">
                Manga Padham
              </span>
            </Link>

            <div className="mt-24 max-w-md">
              <p className="text-xs uppercase tracking-[0.45em] text-cyan-300/80">
                Dark Story Access
              </p>
              <h2 className="mt-5 text-4xl font-semibold tracking-tight text-white">
                {asideTitle}
              </h2>
              <p className="mt-6 text-base leading-8 text-slate-300">
                {asideCopy}
              </p>
            </div>
          </div>

          <div className="grid gap-4 md:grid-cols-3 xl:grid-cols-1">
            <div className="rounded-[24px] border border-white/10 bg-white/5 p-5">
              <p className="text-xs uppercase tracking-[0.35em] text-slate-500">
                Fresh Chapters
              </p>
              <p className="mt-3 text-sm leading-7 text-slate-100">
                Discover new worlds, follow unforgettable heroes, and keep your
                latest reads close at hand.
              </p>
            </div>
            <div className="rounded-[24px] border border-white/10 bg-white/5 p-5">
              <p className="text-xs uppercase tracking-[0.35em] text-slate-500">
                Your Library
              </p>
              <p className="mt-3 text-sm leading-7 text-slate-100">
                Save favorite series, return to ongoing arcs, and keep your
                reading journey organized in one place.
              </p>
            </div>
            <div className="rounded-[24px] border border-white/10 bg-white/5 p-5">
              <p className="text-xs uppercase tracking-[0.35em] text-slate-500">
                Night Reading
              </p>
              <p className="mt-3 text-sm leading-7 text-slate-100">
                Settle into a calm dark mode made for long reading sessions,
                cliffhangers, and one-more-chapter energy.
              </p>
            </div>
          </div>
        </section>

        <section className="flex flex-col justify-between p-6 sm:p-8 lg:p-10">
          <div className="flex flex-col gap-6 sm:flex-row sm:items-center sm:justify-between">
            <Link href="/" className="inline-flex items-center gap-3 xl:hidden">
              <span className="flex h-10 w-10 items-center justify-center rounded-2xl bg-cyan-300 text-sm font-bold text-slate-950">
                MP
              </span>
              <span className="text-sm uppercase tracking-[0.35em] text-slate-300">
                Manga-Padham
              </span>
            </Link>

            <nav className="inline-flex w-full flex-wrap gap-2 rounded-full border border-white/10 bg-white/5 p-1 sm:w-auto">
              {links.map((link) => {
                const active = link.href === activePath;

                return (
                  <Link
                    key={link.href}
                    href={link.href}
                    className={`rounded-full px-4 py-2 text-sm font-medium transition ${
                      active
                        ? "bg-black text-slate-950"
                        : "text-slate-00 hover:bg-white/10 hover:text-white"
                    }`}
                  >
                    {link.label}
                  </Link>
                );
              })}
            </nav>
          </div>

          <div className="mx-auto my-10 w-full max-w-xl">
            <p className="text-xs uppercase tracking-[0.45em] text-cyan-300/80">
              {eyebrow}
            </p>
            <h1 className="mt-4 text-4xl font-semibold tracking-tight text-white sm:text-5xl">
              {title}
            </h1>
            <p className="mt-4 max-w-lg text-base leading-8 text-slate-300">
              {description}
            </p>

            <div className="mt-8">{children}</div>
          </div>

          <div className="mx-auto w-full max-w-xl">{footer}</div>
        </section>
      </div>
    </main>
  );
}

export function AuthField({
  id,
  label,
  type = "text",
  autoComplete,
  placeholder,
  value,
  onChange,
  error,
}: AuthFieldProps) {
  return (
    <label htmlFor={id} className="block">
      <div className="mb-2 flex items-center justify-between text-sm font-medium text-slate-200">
        <span>{label}</span>
        {error ? <span className="text-xs text-rose-300">{error}</span> : null}
      </div>
      <input
        id={id}
        type={type}
        autoComplete={autoComplete}
        placeholder={placeholder}
        value={value}
        onChange={(event) => onChange(event.target.value)}
        aria-invalid={Boolean(error)}
        className={`w-full rounded-[22px] border bg-[rgba(8,14,32,0.9)] px-4 py-3.5 text-base text-white outline-none transition placeholder:text-slate-500 focus:-translate-y-0.5 focus:border-cyan-300 focus:ring-4 focus:ring-cyan-300/10 ${
          error ? "border-rose-400/50" : "border-white/10"
        }`}
      />
    </label>
  );
}

export function FormMessage({ type, message }: FormMessageProps) {
  return (
    <div
      className={`rounded-[22px] border px-4 py-3 text-sm leading-6 ${
        type === "success"
          ? "border-emerald-300/30 bg-emerald-400/10 text-emerald-100"
          : "border-rose-300/30 bg-rose-400/10 text-rose-100"
      }`}
    >
      {message}
    </div>
  );
}

export function SubmitButton({
  label,
  pendingLabel,
  pending,
}: SubmitButtonProps) {
  return (
    <button
      type="submit"
      disabled={pending}
      className="inline-flex w-full items-center justify-center rounded-full bg-cyan-300 px-6 py-3.5 text-sm font-semibold text-slate-950 transition hover:bg-cyan-200 disabled:cursor-not-allowed disabled:bg-cyan-300/60"
    >
      {pending ? pendingLabel : label}
    </button>
  );
}
