import Link from "next/link";
import { redirect } from "next/navigation";
import { connection } from "next/server";
import { getCurrentUser } from "@/lib/auth";
import { loginWithCredentials } from "./actions";

export const instant = false;

type PageProps = {
  searchParams: Promise<{
    error?: string;
  }>;
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
    <div className="min-h-screen bg-slate-50">
      <div className="flex min-h-screen">
        {/* ── Left panel ── */}
        <div className="hidden flex-col justify-between bg-gradient-to-br from-indigo-700 via-indigo-800 to-indigo-900 px-10 py-12 text-white lg:flex lg:w-[52%]">
          {/* Brand */}
          <div className="flex items-center gap-3">
            <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-white/15 ring-1 ring-white/20">
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
            <span className="text-lg font-bold tracking-tight">Reservify</span>
          </div>

          {/* Main copy */}
          <div className="space-y-6">
            <div>
              <span className="inline-block rounded-full bg-white/10 px-3 py-1 text-xs font-semibold uppercase tracking-widest text-indigo-200 ring-1 ring-white/10">
                Secure Access
              </span>
              <h1 className="mt-5 text-4xl font-bold leading-tight tracking-tight xl:text-5xl">
                Resource Reservation
                <br />
                Made Simple
              </h1>
              <p className="mt-4 max-w-md text-base leading-relaxed text-indigo-100">
                Access the reservation system using your credentials. Admins can
                manage resources and approve requests; users can submit
                reservations.
              </p>
            </div>

            {/* Demo credentials */}
            <div className="space-y-3">
              <p className="text-xs font-semibold uppercase tracking-widest text-indigo-300">
                Demo Accounts
              </p>
              <div className="grid gap-3 sm:grid-cols-2">
                <div className="rounded-xl bg-white/8 p-4 ring-1 ring-white/10">
                  <p className="text-xs font-medium text-indigo-300">
                    Admin demo
                  </p>
                  <p className="mt-2 text-sm font-semibold">
                    admin@reservify.local
                  </p>
                  <p className="mt-0.5 font-mono text-xs text-indigo-200">
                    Admin123!
                  </p>
                </div>
                <div className="rounded-xl bg-white/8 p-4 ring-1 ring-white/10">
                  <p className="text-xs font-medium text-indigo-300">
                    User demo
                  </p>
                  <p className="mt-2 text-sm font-semibold">
                    kavindu@reservify.local
                  </p>
                  <p className="mt-0.5 font-mono text-xs text-indigo-200">
                    User123!
                  </p>
                </div>
              </div>
              <div className="rounded-xl bg-white/5 p-4 ring-1 ring-white/10">
                <p className="text-xs font-medium text-indigo-300">
                  Additional users
                </p>
                <ul className="mt-2 space-y-1 font-mono text-xs text-indigo-200">
                  <li>kavishka@reservify.local / User123!</li>
                  <li>nimal@reservify.local / User123!</li>
                </ul>
              </div>
            </div>
          </div>

          <p className="text-xs text-indigo-400">
            © 2026 Reservify · Resource Reservation Management
          </p>
        </div>

        {/* ── Right panel – Login form ── */}
        <div className="flex flex-1 flex-col items-center justify-center px-6 py-12 sm:px-10">
          {/* Mobile brand */}
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
            <span className="text-base font-bold text-slate-900">
              Reservify
            </span>
          </div>

          <div className="w-full max-w-sm">
            <div className="mb-8">
              <h2 className="text-2xl font-bold tracking-tight text-slate-900">
                Sign in to your account
              </h2>
              <p className="mt-2 text-sm text-slate-500">
                Enter your credentials to access the system.
              </p>
            </div>

            {errorMessage && (
              <div className="mb-5 flex items-center gap-2 rounded-xl border border-rose-200 bg-rose-50 px-4 py-3">
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
                <p className="text-sm font-medium text-rose-700">
                  {errorMessage}
                </p>
              </div>
            )}

            <form action={loginWithCredentials} className="space-y-5">
              <div className="space-y-1.5">
                <label
                  htmlFor="email"
                  className="block text-sm font-semibold text-slate-700"
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
                  className="w-full rounded-xl border border-slate-300 bg-white px-4 py-2.5 text-sm text-slate-900 outline-none transition placeholder:text-slate-400 focus:border-indigo-500 focus:ring-3 focus:ring-indigo-500/15"
                />
              </div>

              <div className="space-y-1.5">
                <label
                  htmlFor="password"
                  className="block text-sm font-semibold text-slate-700"
                >
                  Password
                </label>
                <input
                  id="password"
                  name="password"
                  type="password"
                  required
                  autoComplete="current-password"
                  placeholder="Enter your password"
                  className="w-full rounded-xl border border-slate-300 bg-white px-4 py-2.5 text-sm text-slate-900 outline-none transition placeholder:text-slate-400 focus:border-indigo-500 focus:ring-3 focus:ring-indigo-500/15"
                />
              </div>

              <button
                type="submit"
                className="w-full rounded-xl bg-indigo-600 px-5 py-2.5 text-sm font-semibold text-white shadow-sm transition hover:bg-indigo-700 focus:outline-none focus:ring-3 focus:ring-indigo-500/40"
              >
                Sign in
              </button>
            </form>

            {/* Quick nav */}
            <div className="mt-8 rounded-xl border border-slate-200 bg-slate-50 p-4">
              <p className="text-xs font-semibold uppercase tracking-wider text-slate-500">
                Demo routes after login
              </p>
              <div className="mt-3 grid grid-cols-2 gap-2 text-xs">
                {[
                  { label: "Dashboard", href: "/" },
                  { label: "New booking", href: "/bookings/new" },
                  { label: "My bookings", href: "/bookings" },
                  { label: "Admin resources", href: "/admin/resources" },
                ].map((item) => (
                  <Link
                    key={item.href}
                    href={item.href}
                    className="rounded-lg border border-slate-200 bg-white px-2 py-1.5 text-center font-medium text-slate-700 transition hover:border-indigo-300 hover:text-indigo-700"
                  >
                    {item.label}
                  </Link>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}