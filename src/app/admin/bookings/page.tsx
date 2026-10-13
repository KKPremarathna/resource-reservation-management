import Link from "next/link";
import { connection } from "next/server";
import { redirect } from "next/navigation";
import { prisma } from "@/lib/prisma";
import { requireUser } from "@/lib/auth";
import { logoutUser } from "@/app/login/actions";
import { updateBookingStatus } from "./actions";

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

export default async function AdminBookingsPage() {
  await connection();

  const currentUser = await requireUser();

  if (currentUser.role !== "ADMIN") {
    redirect("/");
  }

  const bookings = await prisma.booking.findMany({
    include: {
      requester: {
        select: {
          id: true,
          name: true,
          email: true,
        },
      },
      resource: true,
      team: true,
    },
    orderBy: [
      {
        status: "asc",
      },
      {
        startTime: "asc",
      },
    ],
  });

  const pendingBookings = bookings.filter(
    (booking) => booking.status === "PENDING",
  );

  const reviewedBookings = bookings.filter(
    (booking) => booking.status !== "PENDING",
  );

  return (
    <main className="min-h-screen bg-slate-100 text-slate-900">
      <section className="mx-auto flex w-full max-w-7xl flex-col gap-8 px-4 py-8 sm:px-6 lg:px-8">
        <header className="rounded-3xl bg-slate-900 px-6 py-8 text-white shadow-lg sm:px-8">
          <div className="flex flex-col gap-6 lg:flex-row lg:items-start lg:justify-between">
            <div className="space-y-3">
              <div className="flex flex-wrap items-center gap-3">
                <span className="inline-flex rounded-full bg-emerald-500/15 px-3 py-1 text-sm font-medium text-emerald-200">
                  Admin workspace
                </span>
                <span className="inline-flex rounded-full bg-white/10 px-3 py-1 text-sm font-medium text-slate-200">
                  {currentUser.name}
                </span>
              </div>

              <div>
                <h1 className="text-4xl font-bold tracking-tight sm:text-5xl">
                  Booking review
                </h1>
                <p className="mt-3 max-w-2xl text-base leading-7 text-slate-300 sm:text-lg">
                  Review pending resource requests and record an approval decision.
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
                href="/bookings"
                className="inline-flex items-center justify-center rounded-2xl border border-white/15 px-4 py-2 text-sm font-semibold text-white transition hover:bg-white/10"
              >
                My bookings
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

          <div className="mt-8 grid gap-4 sm:grid-cols-3">
            <div className="rounded-2xl bg-white/10 p-4 backdrop-blur">
              <p className="text-sm text-slate-300">Pending review</p>
              <p className="mt-2 text-3xl font-semibold">
                {pendingBookings.length}
              </p>
            </div>

            <div className="rounded-2xl bg-white/10 p-4 backdrop-blur">
              <p className="text-sm text-slate-300">Reviewed requests</p>
              <p className="mt-2 text-3xl font-semibold">
                {reviewedBookings.length}
              </p>
            </div>

            <div className="rounded-2xl bg-white/10 p-4 backdrop-blur">
              <p className="text-sm text-slate-300">All requests</p>
              <p className="mt-2 text-3xl font-semibold">{bookings.length}</p>
            </div>
          </div>
        </header>

        <section className="rounded-3xl bg-white p-6 shadow-sm ring-1 ring-slate-200 sm:p-8">
          <div>
            <h2 className="text-2xl font-semibold tracking-tight">
              Pending requests
            </h2>
            <p className="mt-1 text-sm text-slate-500">
              Approve only when the requested resource is available for the full
              requested time range.
            </p>
          </div>

          <div className="mt-6 space-y-5">
            {pendingBookings.map((booking) => (
              <article
                key={booking.id}
                className="rounded-2xl border border-amber-200 bg-amber-50 p-5"
              >
                <div className="grid gap-6 xl:grid-cols-[minmax(0,1fr)_22rem]">
                  <div>
                    <div className="flex flex-wrap items-center gap-3">
                      <span
                        className={`rounded-full px-3 py-1 text-xs font-semibold ${getStatusClasses(
                          booking.status,
                        )}`}
                      >
                        {booking.status}
                      </span>
                      <span className="text-xs font-semibold uppercase tracking-[0.2em] text-slate-500">
                        {booking.resource.type}
                      </span>
                    </div>

                    <h3 className="mt-4 text-xl font-semibold text-slate-900">
                      {booking.resource.name}
                    </h3>

                    <p className="mt-2 text-sm leading-6 text-slate-700">
                      {booking.purpose}
                    </p>

                    <dl className="mt-5 grid gap-3 text-sm text-slate-600 sm:grid-cols-2">
                      <div>
                        <dt className="font-medium text-slate-900">Requested by</dt>
                        <dd className="mt-1">
                          {booking.requester.name} ({booking.requester.email})
                        </dd>
                      </div>

                      <div>
                        <dt className="font-medium text-slate-900">Team</dt>
                        <dd className="mt-1">
                          {booking.team?.name ?? "No team selected"}
                        </dd>
                      </div>

                      <div>
                        <dt className="font-medium text-slate-900">Start</dt>
                        <dd className="mt-1">
                          {formatDateTime(booking.startTime)}
                        </dd>
                      </div>

                      <div>
                        <dt className="font-medium text-slate-900">End</dt>
                        <dd className="mt-1">
                          {formatDateTime(booking.endTime)}
                        </dd>
                      </div>

                      <div>
                        <dt className="font-medium text-slate-900">Location</dt>
                        <dd className="mt-1">{booking.resource.location}</dd>
                      </div>
                    </dl>
                  </div>

                  <form
                    action={updateBookingStatus}
                    className="rounded-2xl bg-white p-4 shadow-sm ring-1 ring-slate-200"
                  >
                    <input type="hidden" name="bookingId" value={booking.id} />

                    <label
                      htmlFor={`admin-note-${booking.id}`}
                      className="text-sm font-semibold text-slate-900"
                    >
                      Admin note
                    </label>

                    <textarea
                      id={`admin-note-${booking.id}`}
                      name="adminNote"
                      rows={4}
                      placeholder="Optional decision note for the requester"
                      className="mt-2 w-full rounded-xl border border-slate-300 bg-white px-3 py-2 text-sm text-slate-900 outline-none transition placeholder:text-slate-400 focus:border-slate-900 focus:ring-2 focus:ring-slate-900/15"
                    />

                    <div className="mt-4 grid grid-cols-2 gap-3">
                      <button
                        type="submit"
                        name="status"
                        value="APPROVED"
                        className="rounded-xl bg-emerald-600 px-3 py-2 text-sm font-semibold text-white transition hover:bg-emerald-700"
                      >
                        Approve
                      </button>

                      <button
                        type="submit"
                        name="status"
                        value="REJECTED"
                        className="rounded-xl bg-rose-600 px-3 py-2 text-sm font-semibold text-white transition hover:bg-rose-700"
                      >
                        Reject
                      </button>
                    </div>
                  </form>
                </div>
              </article>
            ))}

            {pendingBookings.length === 0 ? (
              <div className="rounded-2xl border border-dashed border-slate-300 bg-slate-50 px-6 py-12 text-center">
                <h3 className="text-lg font-semibold text-slate-900">
                  No pending requests
                </h3>
                <p className="mx-auto mt-2 max-w-md text-sm leading-6 text-slate-500">
                  All booking requests have been reviewed. New requests will
                  appear here when users submit them.
                </p>
              </div>
            ) : null}
          </div>
        </section>

        <section className="rounded-3xl bg-white p-6 shadow-sm ring-1 ring-slate-200 sm:p-8">
          <div>
            <h2 className="text-2xl font-semibold tracking-tight">
              Recent decisions
            </h2>
            <p className="mt-1 text-sm text-slate-500">
              The most recently scheduled reviewed bookings.
            </p>
          </div>

          <div className="mt-6 overflow-x-auto">
            <table className="min-w-full divide-y divide-slate-200 text-left text-sm">
              <thead className="bg-slate-50 text-xs font-semibold uppercase tracking-[0.16em] text-slate-500">
                <tr>
                  <th className="px-4 py-3">Resource</th>
                  <th className="px-4 py-3">Requester</th>
                  <th className="px-4 py-3">Time</th>
                  <th className="px-4 py-3">Status</th>
                  <th className="px-4 py-3">Admin note</th>
                </tr>
              </thead>

              <tbody className="divide-y divide-slate-100 bg-white text-slate-700">
                {reviewedBookings.map((booking) => (
                  <tr key={booking.id}>
                    <td className="px-4 py-4 font-medium text-slate-900">
                      {booking.resource.name}
                    </td>
                    <td className="px-4 py-4">
                      {booking.requester.name}
                      <span className="block text-xs text-slate-500">
                        {booking.requester.email}
                      </span>
                    </td>
                    <td className="px-4 py-4">
                      <span className="block">
                        {formatDateTime(booking.startTime)}
                      </span>
                      <span className="block text-xs text-slate-500">
                        to {formatDateTime(booking.endTime)}
                      </span>
                    </td>
                    <td className="px-4 py-4">
                      <span
                        className={`inline-flex rounded-full px-3 py-1 text-xs font-semibold ${getStatusClasses(
                          booking.status,
                        )}`}
                      >
                        {booking.status}
                      </span>
                    </td>
                    <td className="max-w-xs px-4 py-4 text-slate-600">
                      {booking.adminNote ?? "—"}
                    </td>
                  </tr>
                ))}

                {reviewedBookings.length === 0 ? (
                  <tr>
                    <td
                      colSpan={5}
                      className="px-4 py-8 text-center text-sm text-slate-500"
                    >
                      No bookings have been reviewed yet.
                    </td>
                  </tr>
                ) : null}
              </tbody>
            </table>
          </div>
        </section>
      </section>
    </main>
  );
}