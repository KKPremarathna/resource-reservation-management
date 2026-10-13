import Link from "next/link";
import { connection } from "next/server";
import { prisma } from "@/lib/prisma";
import { requireUser } from "@/lib/auth";
import { logoutUser } from "@/app/login/actions";

export const instant = false;

function formatDateTime(date: Date) {
  return new Intl.DateTimeFormat("en-LK", {
    dateStyle: "medium",
    timeStyle: "short",
  }).format(date);
}

function getStatusClasses(status: string) {
  if (status === "APPROVED") {
    return "bg-emerald-100 text-emerald-700";
  }

  if (status === "PENDING") {
    return "bg-amber-100 text-amber-700";
  }

  if (status === "REJECTED") {
    return "bg-rose-100 text-rose-700";
  }

  return "bg-slate-200 text-slate-700";
}

export default async function MyBookingsPage() {
  await connection();

  const currentUser = await requireUser();

  const bookings = await prisma.booking.findMany({
    where: {
      requesterId: currentUser.id,
    },
    include: {
      resource: true,
      team: true,
    },
    orderBy: {
      startTime: "desc",
    },
  });

  const pendingCount = bookings.filter(
    (booking) => booking.status === "PENDING",
  ).length;

  const approvedCount = bookings.filter(
    (booking) => booking.status === "APPROVED",
  ).length;

  const rejectedCount = bookings.filter(
    (booking) =>
      booking.status === "REJECTED" || booking.status === "CANCELLED",
  ).length;

  return (
    <main className="min-h-screen bg-slate-100 text-slate-900">
      <section className="mx-auto flex w-full max-w-7xl flex-col gap-8 px-4 py-8 sm:px-6 lg:px-8">
        <header className="rounded-3xl bg-slate-900 px-6 py-8 text-white shadow-lg sm:px-8">
          <div className="flex flex-col gap-6 lg:flex-row lg:items-start lg:justify-between">
            <div className="space-y-3">
              <div className="flex flex-wrap items-center gap-3">
                <span className="inline-flex rounded-full bg-white/10 px-3 py-1 text-sm font-medium text-slate-200">
                  Booking History
                </span>
                <span className="inline-flex rounded-full bg-emerald-500/15 px-3 py-1 text-sm font-medium text-emerald-200">
                  {currentUser.name}
                </span>
              </div>

              <div>
                <h1 className="text-4xl font-bold tracking-tight sm:text-5xl">
                  My bookings
                </h1>
                <p className="mt-3 max-w-2xl text-base leading-7 text-slate-300 sm:text-lg">
                  Review your reservation requests, approval status, and admin
                  notes in one place.
                </p>
              </div>
            </div>

            <div className="flex flex-wrap items-center gap-3">
              <Link
                href="/"
                className="inline-flex items-center justify-center rounded-2xl border border-white/15 px-4 py-2 text-sm font-semibold text-white transition hover:bg-white/10"
              >
                Dashboard
              </Link>

              <Link
                href="/bookings/new"
                className="inline-flex items-center justify-center rounded-2xl bg-white px-4 py-2 text-sm font-semibold text-slate-900 transition hover:bg-slate-200"
              >
                New booking
              </Link>

              <form action={logoutUser}>
                <button
                  type="submit"
                  className="inline-flex items-center justify-center rounded-2xl border border-rose-300/25 px-4 py-2 text-sm font-semibold text-rose-100 transition hover:bg-rose-500/10"
                >
                  Logout
                </button>
              </form>
            </div>
          </div>

          <div className="mt-8 grid grid-cols-2 gap-4 sm:grid-cols-4">
            <div className="rounded-2xl bg-white/10 p-4 backdrop-blur">
              <p className="text-sm text-slate-300">Total requests</p>
              <p className="mt-2 text-3xl font-semibold">{bookings.length}</p>
            </div>

            <div className="rounded-2xl bg-white/10 p-4 backdrop-blur">
              <p className="text-sm text-slate-300">Pending</p>
              <p className="mt-2 text-3xl font-semibold">{pendingCount}</p>
            </div>

            <div className="rounded-2xl bg-white/10 p-4 backdrop-blur">
              <p className="text-sm text-slate-300">Approved</p>
              <p className="mt-2 text-3xl font-semibold">{approvedCount}</p>
            </div>

            <div className="rounded-2xl bg-white/10 p-4 backdrop-blur">
              <p className="text-sm text-slate-300">Rejected / cancelled</p>
              <p className="mt-2 text-3xl font-semibold">{rejectedCount}</p>
            </div>
          </div>
        </header>

        <section className="rounded-3xl bg-white p-6 shadow-sm ring-1 ring-slate-200 sm:p-8">
          <div className="flex flex-col gap-2 sm:flex-row sm:items-end sm:justify-between">
            <div>
              <h2 className="text-2xl font-semibold tracking-tight">
                Request timeline
              </h2>
              <p className="mt-1 text-sm text-slate-500">
                Your latest reservation requests appear first.
              </p>
            </div>

            <p className="text-sm text-slate-500">
              Signed in as{" "}
              <span className="font-medium text-slate-900">
                {currentUser.email}
              </span>
            </p>
          </div>

          <div className="mt-6 space-y-4">
            {bookings.map((booking) => (
              <article
                key={booking.id}
                className="rounded-2xl border border-slate-200 bg-slate-50 p-5"
              >
                <div className="flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between">
                  <div>
                    <div className="flex flex-wrap items-center gap-3">
                      <p className="text-xs font-semibold uppercase tracking-[0.2em] text-slate-500">
                        {booking.resource.type}
                      </p>
                      <span
                        className={`rounded-full px-3 py-1 text-xs font-semibold ${getStatusClasses(
                          booking.status,
                        )}`}
                      >
                        {booking.status}
                      </span>
                    </div>

                    <h3 className="mt-3 text-xl font-semibold text-slate-900">
                      {booking.resource.name}
                    </h3>

                    <p className="mt-2 text-sm leading-6 text-slate-600">
                      {booking.purpose}
                    </p>
                  </div>

                  <div className="rounded-2xl bg-white p-4 text-sm text-slate-600 ring-1 ring-slate-200 lg:min-w-72">
                    <p>
                      <span className="font-medium text-slate-900">Start:</span>{" "}
                      {formatDateTime(booking.startTime)}
                    </p>
                    <p className="mt-2">
                      <span className="font-medium text-slate-900">End:</span>{" "}
                      {formatDateTime(booking.endTime)}
                    </p>
                    <p className="mt-2">
                      <span className="font-medium text-slate-900">
                        Location:
                      </span>{" "}
                      {booking.resource.location}
                    </p>
                    {booking.team ? (
                      <p className="mt-2">
                        <span className="font-medium text-slate-900">
                          Team:
                        </span>{" "}
                        {booking.team.name}
                      </p>
                    ) : null}
                  </div>
                </div>

                {booking.adminNote ? (
                  <div className="mt-5 rounded-2xl border border-slate-200 bg-white p-4">
                    <p className="text-xs font-semibold uppercase tracking-[0.2em] text-slate-500">
                      Admin note
                    </p>
                    <p className="mt-2 text-sm leading-6 text-slate-700">
                      {booking.adminNote}
                    </p>
                  </div>
                ) : null}
              </article>
            ))}

            {bookings.length === 0 ? (
              <div className="rounded-2xl border border-dashed border-slate-300 bg-slate-50 px-6 py-12 text-center">
                <h3 className="text-lg font-semibold text-slate-900">
                  No booking requests yet
                </h3>
                <p className="mx-auto mt-2 max-w-md text-sm leading-6 text-slate-500">
                  Create your first reservation request to reserve a facility or
                  shared resource.
                </p>
                <Link
                  href="/bookings/new"
                  className="mt-6 inline-flex items-center justify-center rounded-2xl bg-slate-900 px-4 py-2 text-sm font-semibold text-white transition hover:bg-slate-800"
                >
                  Create booking
                </Link>
              </div>
            ) : null}
          </div>
        </section>
      </section>
    </main>
  );
}