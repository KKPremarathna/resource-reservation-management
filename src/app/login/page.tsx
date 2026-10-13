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
  if (error === "missing") {
    return "Email and password are required.";
  }

  if (error === "invalid") {
    return "Invalid email or password.";
  }

  return null;
}

export default async function LoginPage({ searchParams }: PageProps) {
  await connection();

  const currentUser = await getCurrentUser();

  if (currentUser) {
    redirect("/");
  }

  const params = await searchParams;
  const errorMessage = getErrorMessage(params.error);

  return (
    <main className="min-h-screen bg-slate-100 text-slate-900">
      <section className="mx-auto flex min-h-screen w-full max-w-6xl items-center px-4 py-8 sm:px-6 lg:px-8">
        <div className="grid w-full gap-8 lg:grid-cols-[1fr_0.95fr]">
          <div className="rounded-3xl bg-slate-900 px-6 py-8 text-white shadow-lg sm:px-8 sm:py-10">
            <div className="space-y-5">
              <span className="inline-flex rounded-full bg-white/10 px-3 py-1 text-sm font-medium text-slate-200">
                Reservify Secure Access
              </span>

              <div className="space-y-4">
                <h1 className="text-4xl font-bold tracking-tight sm:text-5xl">
                  Sign in to continue
                </h1>
                <p className="max-w-2xl text-base leading-7 text-slate-300 sm:text-lg">
                  Access the resource reservation system using your email and
                  password. Admin users can manage resources and approve booking
                  requests, while individual users can submit reservations.
                </p>
              </div>

              <div className="grid gap-4 sm:grid-cols-2">
                <div className="rounded-2xl bg-white/10 p-4 backdrop-blur">
                  <p className="text-sm text-slate-300">Admin demo account</p>
                  <p className="mt-2 text-lg font-semibold">
                    admin@reservify.local
                  </p>
                  <p className="mt-1 text-sm text-slate-300">Admin123!</p>
                </div>

                <div className="rounded-2xl bg-white/10 p-4 backdrop-blur">
                  <p className="text-sm text-slate-300">User demo account</p>
                  <p className="mt-2 text-lg font-semibold">
                    kavindu@reservify.local
                  </p>
                  <p className="mt-1 text-sm text-slate-300">User123!</p>
                </div>
              </div>

              <div className="rounded-2xl border border-white/10 bg-white/5 p-4">
                <p className="text-sm text-slate-200">
                  Additional user accounts:
                </p>
                <ul className="mt-3 space-y-2 text-sm text-slate-300">
                  <li>kavishka@reservify.local / User123!</li>
                  <li>nimal@reservify.local / User123!</li>
                </ul>
              </div>
            </div>
          </div>

          <div className="rounded-3xl bg-white p-6 shadow-sm ring-1 ring-slate-200 sm:p-8">
            <div className="mb-6">
              <h2 className="text-2xl font-semibold tracking-tight">
                Login
              </h2>
              <p className="mt-1 text-sm text-slate-500">
                Enter your credentials to access the system.
              </p>
            </div>

            {errorMessage ? (
              <div className="mb-5 rounded-2xl border border-rose-200 bg-rose-50 px-4 py-3 text-sm font-medium text-rose-700">
                {errorMessage}
              </div>
            ) : null}

            <form action={loginWithCredentials} className="space-y-5">
              <div className="space-y-2">
                <label
                  htmlFor="email"
                  className="text-sm font-medium text-slate-700"
                >
                  Email
                </label>
                <input
                  id="email"
                  name="email"
                  type="email"
                  required
                  placeholder="admin@reservify.local"
                  className="w-full rounded-2xl border border-slate-300 bg-white px-4 py-3 outline-none transition focus:border-slate-900 focus:ring-2 focus:ring-slate-200"
                />
              </div>

              <div className="space-y-2">
                <label
                  htmlFor="password"
                  className="text-sm font-medium text-slate-700"
                >
                  Password
                </label>
                <input
                  id="password"
                  name="password"
                  type="password"
                  required
                  placeholder="Enter your password"
                  className="w-full rounded-2xl border border-slate-300 bg-white px-4 py-3 outline-none transition focus:border-slate-900 focus:ring-2 focus:ring-slate-200"
                />
              </div>

              <button
                type="submit"
                className="inline-flex w-full items-center justify-center rounded-2xl bg-slate-900 px-5 py-3 text-sm font-semibold text-white transition hover:bg-slate-800"
              >
                Sign in
              </button>
            </form>

            <div className="mt-8 rounded-2xl bg-slate-50 p-4 ring-1 ring-slate-200">
              <p className="text-sm font-medium text-slate-700">
                Demo routes after login
              </p>
              <div className="mt-3 space-y-2 text-sm text-slate-600">
                <p>
                  Dashboard:{" "}
                  <Link href="/" className="font-medium text-slate-900 underline">
                    /
                  </Link>
                </p>
                <p>
                  New booking:{" "}
                  <Link
                    href="/bookings/new"
                    className="font-medium text-slate-900 underline"
                  >
                    /bookings/new
                  </Link>
                </p>
                <p>
                  Admin resources:{" "}
                  <span className="font-medium text-slate-900">
                    /admin/resources
                  </span>
                </p>
                <p>
                  Admin bookings:{" "}
                  <span className="font-medium text-slate-900">
                    /admin/bookings
                  </span>
                </p>
              </div>
            </div>
          </div>
        </div>
      </section>
    </main>
  );
}