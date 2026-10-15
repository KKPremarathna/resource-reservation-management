import { redirect } from "next/navigation";
import { connection } from "next/server";
import { getCurrentUser } from "@/lib/auth";
import { loginWithCredentials } from "./actions";

export const instant = false;

type PageProps = {
  searchParams: Promise<{ error?: string }>;
};

function getErrorMessage(error?: string) {
  if (error === "missing") return "Email and password are required.";
  if (error === "invalid") return "Invalid email or password.";
  return null;
}

export default async function LoginPage({ searchParams }: PageProps) {
  await connection();

  const currentUser = await getCurrentUser();
  if (currentUser) redirect("/");

  const params = await searchParams;
  const errorMessage = getErrorMessage(params.error);

  return (
    <div className="flex min-h-screen bg-slate-50">
      {/* ── Left Branding Panel (Desktop) ── */}
      <div className="hidden flex-col justify-between border-r border-slate-200 bg-white px-12 py-12 lg:flex lg:w-1/2">
        {/* Brand */}
        <div className="flex items-center gap-3">
          <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-indigo-600 shadow-xs">
            <svg
              className="h-5 w-5 text-white"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
              strokeWidth={2.5}
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                d="M6.75 3v2.25M17.25 3v2.25M3 18.75V7.5a2.25 2.25 0 0 1 2.25-2.25h13.5A2.25 2.25 0 0 1 21 7.5v11.25m-18 0A2.25 2.25 0 0 0 5.25 21h13.5A2.25 2.25 0 0 0 21 18.75m-18 0v-7.5A2.25 2.25 0 0 1 5.25 9h13.5A2.25 2.25 0 0 1 21 11.25v7.5"
              />
            </svg>
          </div>
          <span className="text-xl font-bold tracking-tight text-slate-900">
            Reservify
          </span>
        </div>

        {/* Center Content */}
        <div className="max-w-md space-y-6">
          <span className="inline-block rounded-full bg-indigo-50 px-3 py-1 text-xs font-semibold text-indigo-700 ring-1 ring-indigo-200">
            Resource Reservation Management
          </span>
          <h1 className="text-3xl font-bold tracking-tight text-slate-900 sm:text-4xl">
            Book resources with clarity and ease.
          </h1>
          <p className="text-sm leading-relaxed text-slate-600">
            Streamline room reservations, equipment bookings, and facility
            management. Admins review and approve; users book and track.
          </p>

          {/* Demo Accounts */}
          <div className="space-y-3 pt-4">
            <p className="text-xs font-semibold uppercase tracking-wider text-slate-400">
              Demo Credentials
            </p>
            <div className="grid gap-3 sm:grid-cols-2">
              <div className="rounded-xl border border-slate-200 bg-slate-50 p-3.5">
                <span className="inline-block rounded-md bg-indigo-100 px-2 py-0.5 text-[10px] font-bold text-indigo-700">
                  ADMIN
                </span>
                <p className="mt-2 text-xs font-semibold text-slate-900">
                  admin@reservify.local
                </p>
                <p className="font-mono text-xs text-slate-500">Admin123!</p>
              </div>
              <div className="rounded-xl border border-slate-200 bg-slate-50 p-3.5">
                <span className="inline-block rounded-md bg-slate-200 px-2 py-0.5 text-[10px] font-bold text-slate-700">
                  USER
                </span>
                <p className="mt-2 text-xs font-semibold text-slate-900">
                  kavindu@reservify.local
                </p>
                <p className="font-mono text-xs text-slate-500">User123!</p>
              </div>
            </div>
          </div>
        </div>

        <p className="text-xs text-slate-400">
          © 2026 Reservify · Resource Reservation Management MVP
        </p>
      </div>

      {/* ── Right Form Panel ── */}
      <div className="flex flex-1 flex-col items-center justify-center px-6 py-12 sm:px-12">
        {/* Mobile Brand */}
        <div className="mb-8 flex items-center gap-2 lg:hidden">
          <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-indigo-600">
            <svg
              className="h-4 w-4 text-white"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
              strokeWidth={2.5}
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                d="M6.75 3v2.25M17.25 3v2.25M3 18.75V7.5a2.25 2.25 0 0 1 2.25-2.25h13.5A2.25 2.25 0 0 1 21 7.5v11.25m-18 0A2.25 2.25 0 0 0 5.25 21h13.5A2.25 2.25 0 0 0 21 18.75m-18 0v-7.5A2.25 2.25 0 0 1 5.25 9h13.5A2.25 2.25 0 0 1 21 11.25v7.5"
              />
            </svg>
          </div>
          <span className="text-lg font-bold text-slate-900">Reservify</span>
        </div>

        <div className="w-full max-w-sm rounded-2xl border border-slate-200 bg-white p-8 shadow-xs">
          <div className="mb-6">
            <h2 className="text-xl font-bold tracking-tight text-slate-900">
              Sign in to your account
            </h2>
            <p className="mt-1 text-xs text-slate-500">
              Enter your email and password to continue.
            </p>
          </div>

          {errorMessage && (
            <div className="mb-5 flex items-center gap-2 rounded-xl border border-rose-200 bg-rose-50 px-3.5 py-2.5 text-xs font-medium text-rose-700">
              <svg
                className="h-4 w-4 shrink-0 text-rose-500"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z"
                />
              </svg>
              <span>{errorMessage}</span>
            </div>
          )}

          <form action={loginWithCredentials} className="space-y-4">
            <div className="space-y-1.5">
              <label
                htmlFor="email"
                className="block text-xs font-semibold text-slate-700"
              >
                Email address
              </label>
              <input
                id="email"
                name="email"
                type="email"
                required
                autoComplete="email"
                placeholder="admin@reservify.local"
                className="w-full rounded-xl border border-slate-300 bg-white px-3.5 py-2 text-sm text-slate-900 outline-none transition placeholder:text-slate-400 focus:border-indigo-500 focus:ring-3 focus:ring-indigo-500/15"
              />
            </div>

            <div className="space-y-1.5">
              <label
                htmlFor="password"
                className="block text-xs font-semibold text-slate-700"
              >
                Password
              </label>
              <input
                id="password"
                name="password"
                type="password"
                required
                autoComplete="current-password"
                placeholder="••••••••"
                className="w-full rounded-xl border border-slate-300 bg-white px-3.5 py-2 text-sm text-slate-900 outline-none transition placeholder:text-slate-400 focus:border-indigo-500 focus:ring-3 focus:ring-indigo-500/15"
              />
            </div>

            <button
              type="submit"
              className="mt-2 w-full rounded-xl bg-indigo-600 py-2.5 text-sm font-semibold text-white shadow-xs transition hover:bg-indigo-700 focus:outline-none focus:ring-3 focus:ring-indigo-500/40"
            >
              Sign in
            </button>
          </form>

          {/* Quick Demo Fill hint for mobile */}
          <div className="mt-6 border-t border-slate-100 pt-4 lg:hidden">
            <p className="text-[11px] font-semibold text-slate-400">
              Demo accounts:
            </p>
            <p className="mt-1 text-xs text-slate-600">
              Admin: admin@reservify.local / Admin123!
            </p>
            <p className="text-xs text-slate-600">
              User: kavindu@reservify.local / User123!
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}