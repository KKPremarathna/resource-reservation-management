import { connection } from "next/server";
import { redirect } from "next/navigation";
import Link from "next/link";
import { prisma } from "@/lib/prisma";
import { requireUser } from "@/lib/auth";
import { logoutUser } from "@/app/login/actions";
import NewBookingForm from "./NewBookingForm";

export const instant = false;

export default async function NewBookingPage() {
  await connection();

  const currentUser = await requireUser();

  // Admins manage resources — they do not create bookings
  if (currentUser.role === "ADMIN") redirect("/admin/resources");

  const [resources, teams] = await Promise.all([
    prisma.resource.findMany({
      where: { status: "AVAILABLE" },
      orderBy: { name: "asc" },
    }),
    prisma.team.findMany({ orderBy: { name: "asc" } }),
  ]);

  return (
    <div className="min-h-screen bg-slate-50">
      {/* ── Navbar ── */}
      <nav className="sticky top-0 z-30 border-b border-slate-200 bg-white/90 shadow-sm backdrop-blur-md">
        <div className="mx-auto flex max-w-7xl items-center justify-between px-4 py-3 sm:px-6 lg:px-8">
          <div className="flex items-center gap-3">
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
            <Link
              href="/"
              className="text-base font-bold tracking-tight text-slate-900"
            >
              Reservify
            </Link>
          </div>

          <div className="flex items-center gap-2">
            <Link
              href="/"
              className="rounded-lg px-3 py-2 text-sm font-medium text-slate-600 transition hover:bg-slate-100"
            >
              Dashboard
            </Link>
            <Link
              href="/bookings"
              className="rounded-lg px-3 py-2 text-sm font-medium text-slate-600 transition hover:bg-slate-100"
            >
              My Bookings
            </Link>
            <form action={logoutUser}>
              <button
                type="submit"
                className="rounded-lg border border-slate-200 bg-white px-3 py-1.5 text-sm font-medium text-slate-600 transition hover:bg-slate-50"
              >
                Logout
              </button>
            </form>
          </div>
        </div>
      </nav>

      <main className="mx-auto max-w-2xl px-4 py-10 sm:px-6 lg:px-8">
        {/* Page header */}
        <div className="mb-6">
          <span className="inline-block rounded-full bg-indigo-100 px-2.5 py-0.5 text-xs font-semibold text-indigo-700">
            Create Reservation
          </span>
          <h1 className="mt-3 text-2xl font-bold tracking-tight text-slate-900">
            New Booking Request
          </h1>
          <p className="mt-1 text-sm text-slate-500">
            Submit a request for a shared resource. Approved bookings with
            overlapping times will be blocked automatically.
          </p>
        </div>

        <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm sm:p-8">
          <NewBookingForm resources={resources} teams={teams} />
        </div>

        {resources.length === 0 && (
          <div className="mt-4 rounded-xl border border-amber-200 bg-amber-50 px-4 py-3 text-sm text-amber-700">
            No available resources at the moment. Please check back later or
            contact your admin.
          </div>
        )}
      </main>
    </div>
  );
}