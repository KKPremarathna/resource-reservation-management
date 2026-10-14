import Link from "next/link";
import { connection } from "next/server";
import { prisma } from "@/lib/prisma";
import { requireUser } from "@/lib/auth";
import { logoutUser } from "@/app/login/actions";
import { cancelBooking } from "./actions";

export const instant = false;

function formatDateTime(date: Date) {
  return new Intl.DateTimeFormat("en-LK", {
    dateStyle: "medium",
    timeStyle: "short",
  }).format(date);
}

function getStatusClasses(status: string) {
  if (status === "APPROVED")
    return "bg-emerald-50 text-emerald-700 ring-1 ring-emerald-200";
  if (status === "PENDING")
    return "bg-amber-50 text-amber-700 ring-1 ring-amber-200";
  if (status === "REJECTED")
    return "bg-rose-50 text-rose-700 ring-1 ring-rose-200";
  if (status === "CANCELLED")
    return "bg-slate-100 text-slate-500 ring-1 ring-slate-200";
  return "bg-slate-100 text-slate-500 ring-1 ring-slate-200";
}

export default async function MyBookingsPage() {
  await connection();

  const currentUser = await requireUser();

  const bookings = await prisma.booking.findMany({
    where: { requesterId: currentUser.id },
    include: { resource: true, team: true },
    orderBy: { startTime: "desc" },
  });

  const pendingCount = bookings.filter((b) => b.status === "PENDING").length;
  const approvedCount = bookings.filter((b) => b.status === "APPROVED").length;
  const rejectedOrCancelledCount = bookings.filter(
    (b) => b.status === "REJECTED" || b.status === "CANCELLED",
  ).length;

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
              className="rounded-lg px-3 py-2 text-sm font-medium text-slate-600 transition hover:bg-slate-100 hover:text-slate-900"
            >
              Dashboard
            </Link>
            <Link
              href="/bookings/new"
              className="rounded-lg bg-indigo-600 px-3 py-2 text-sm font-semibold text-white transition hover:bg-indigo-700"
            >
              + New Booking
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

      <main className="mx-auto max-w-7xl px-4 py-4 sm:px-6 lg:px-8">
        {/* Page header */}
        <div className="mb-4">
          <div className="flex flex-wrap items-center gap-2">
            <span className="rounded-full bg-indigo-100 px-2.5 py-0.5 text-xs font-semibold text-indigo-700">
              Booking History
            </span>
            <span className="rounded-full bg-slate-100 px-2.5 py-0.5 text-xs font-medium text-slate-600">
              {currentUser.name}
            </span>
          </div>
          <h1 className="mt-3 text-2xl font-bold tracking-tight text-slate-900">
            My Bookings
          </h1>
          <p className="mt-1 text-sm text-slate-500">
            Review your reservation requests, approval status, and admin notes
            in one place.
          </p>
        </div>

        {/* Stat strip */}
        <div className="mb-4 grid grid-cols-2 gap-3 sm:grid-cols-4">
          {[
            { label: "Total Requests", value: bookings.length, color: "indigo" },
            { label: "Pending", value: pendingCount, color: "amber" },
            { label: "Approved", value: approvedCount, color: "emerald" },
            {
              label: "Rejected / Cancelled",
              value: rejectedOrCancelledCount,
              color: "rose",
            },
          ].map((stat) => (
            <div
              key={stat.label}
              className="rounded-xl border border-slate-200 bg-white p-3 shadow-sm"
            >
              <p className="text-xs font-medium text-slate-500">{stat.label}</p>
              <p className="mt-1.5 text-2xl font-bold text-slate-900">
                {stat.value}
              </p>
            </div>
          ))}
        </div>

        {/* Bookings list */}
        <section className="rounded-2xl border border-slate-200 bg-white shadow-sm">
          <div className="flex items-center justify-between border-b border-slate-100 px-6 py-4">
            <div>
              <h2 className="text-base font-semibold text-slate-900">
                Request Timeline
              </h2>
              <p className="mt-0.5 text-sm text-slate-500">
                Your latest reservation requests appear first.
              </p>
            </div>
            <p className="hidden text-xs text-slate-500 sm:block">
              Signed in as{" "}
              <span className="font-medium text-slate-700">
                {currentUser.email}
              </span>
            </p>
          </div>

          <div className="scroll-list divide-y divide-slate-50 px-6 py-2" style={{maxHeight: '32rem'}}>
            {bookings.map((booking) => (
              <article key={booking.id} className="py-3.5">
                <div className="flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between">
                  <div className="min-w-0 flex-1">
                    <div className="flex flex-wrap items-center gap-2">
                      <span className="text-[11px] font-semibold uppercase tracking-widest text-slate-400">
                        {booking.resource.type}
                      </span>
                      <span
                        className={`rounded-full px-2.5 py-0.5 text-[11px] font-semibold ${getStatusClasses(booking.status)}`}
                      >
                        {booking.status}
                      </span>
                    </div>
                    <h3 className="mt-2 text-base font-semibold text-slate-900">
                      {booking.resource.name}
                    </h3>
                    <p className="mt-1 text-sm leading-relaxed text-slate-600">
                      {booking.purpose}
                    </p>
                  </div>

                  <div className="shrink-0 rounded-xl border border-slate-100 bg-slate-50 p-3 text-xs text-slate-600 lg:min-w-56">
                    <p>
                      <span className="font-semibold text-slate-800">
                        Start:
                      </span>{" "}
                      {formatDateTime(booking.startTime)}
                    </p>
                    <p className="mt-1">
                      <span className="font-semibold text-slate-800">End:</span>{" "}
                      {formatDateTime(booking.endTime)}
                    </p>
                    <p className="mt-1">
                      <span className="font-semibold text-slate-800">
                        Location:
                      </span>{" "}
                      {booking.resource.location}
                    </p>
                    {booking.team && (
                      <p className="mt-1">
                        <span className="font-semibold text-slate-800">
                          Team:
                        </span>{" "}
                        {booking.team.name}
                      </p>
                    )}
                  </div>
                </div>

                {booking.adminNote && (
                  <div className="mt-4 rounded-xl border border-slate-200 bg-slate-50 px-4 py-3">
                    <p className="text-[11px] font-semibold uppercase tracking-widest text-slate-400">
                      Admin Note
                    </p>
                    <p className="mt-1.5 text-sm leading-relaxed text-slate-700">
                      {booking.adminNote}
                    </p>
                  </div>
                )}

                {booking.status === "PENDING" && (
                  <form action={cancelBooking} className="mt-4">
                    <input
                      type="hidden"
                      name="bookingId"
                      value={booking.id}
                    />
                    <button
                      type="submit"
                      className="rounded-lg border border-rose-200 bg-white px-4 py-2 text-xs font-semibold text-rose-600 transition hover:bg-rose-50 hover:border-rose-300"
                    >
                      Cancel request
                    </button>
                  </form>
                )}
              </article>
            ))}

            {bookings.length === 0 && (
              <div className="py-16 text-center">
                <div className="mx-auto mb-3 flex h-14 w-14 items-center justify-center rounded-full bg-slate-100">
                  <svg
                    className="h-6 w-6 text-slate-400"
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={1.5}
                      d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z"
                    />
                  </svg>
                </div>
                <h3 className="text-base font-semibold text-slate-800">
                  No booking requests yet
                </h3>
                <p className="mx-auto mt-2 max-w-sm text-sm text-slate-500">
                  Create your first reservation to reserve a facility or shared
                  resource.
                </p>
                <Link
                  href="/bookings/new"
                  className="mt-5 inline-flex items-center rounded-xl bg-indigo-600 px-5 py-2.5 text-sm font-semibold text-white transition hover:bg-indigo-700"
                >
                  Create Booking
                </Link>
              </div>
            )}
          </div>
        </section>
      </main>
    </div>
  );
}