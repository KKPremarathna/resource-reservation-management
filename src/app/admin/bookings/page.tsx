import Link from "next/link";
import { connection } from "next/server";
import { prisma } from "@/lib/prisma";
import { approveBooking, rejectBooking } from "./actions";
import { requireAdmin } from "@/lib/auth";

export const instant = false;

function formatDateTime(date: Date) {
  return new Intl.DateTimeFormat("en-LK", {
    dateStyle: "medium",
    timeStyle: "short",
  }).format(date);
}

export default async function AdminBookingsPage() {
  await requireAdmin();
  await connection();

  const [pendingBookings, approvedBookings, rejectedBookings] =
    await Promise.all([
      prisma.booking.findMany({
        where: { status: "PENDING" },
        include: {
          resource: true,
          requester: true,
          team: true,
        },
        orderBy: { createdAt: "asc" },
      }),
      prisma.booking.findMany({
        where: { status: "APPROVED" },
        include: {
          resource: true,
          requester: true,
          team: true,
        },
        orderBy: { startTime: "asc" },
        take: 5,
      }),
      prisma.booking.findMany({
        where: { status: "REJECTED" },
        include: {
          resource: true,
          requester: true,
          team: true,
        },
        orderBy: { updatedAt: "desc" },
        take: 5,
      }),
    ]);

  return (
    <main className="min-h-screen bg-slate-100 text-slate-900">
      <section className="mx-auto flex w-full max-w-7xl flex-col gap-8 px-4 py-8 sm:px-6 lg:px-8">
        <header className="rounded-3xl bg-slate-900 px-6 py-8 text-white shadow-lg sm:px-8">
          <div className="flex flex-col gap-6 lg:flex-row lg:items-end lg:justify-between">
            <div className="space-y-3">
              <div className="flex flex-wrap items-center gap-3">
                <span className="inline-flex rounded-full bg-white/10 px-3 py-1 text-sm font-medium text-slate-200">
                  Admin Booking Review
                </span>
                <Link
                  href="/"
                  className="inline-flex rounded-full border border-white/15 px-3 py-1 text-sm text-slate-200 transition hover:bg-white/10"
                >
                  Back to dashboard
                </Link>
              </div>

              <div>
                <h1 className="text-4xl font-bold tracking-tight sm:text-5xl">
                  Review booking requests
                </h1>
                <p className="mt-3 max-w-2xl text-base leading-7 text-slate-300 sm:text-lg">
                  Approve or reject pending booking requests for facilities and
                  resources.
                </p>
              </div>
            </div>

            <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
              <div className="rounded-2xl bg-white/10 p-4 backdrop-blur">
                <p className="text-sm text-slate-300">Pending</p>
                <p className="mt-2 text-3xl font-semibold">
                  {pendingBookings.length}
                </p>
              </div>
              <div className="rounded-2xl bg-white/10 p-4 backdrop-blur">
                <p className="text-sm text-slate-300">Approved</p>
                <p className="mt-2 text-3xl font-semibold">
                  {approvedBookings.length}
                </p>
              </div>
              <div className="rounded-2xl bg-white/10 p-4 backdrop-blur">
                <p className="text-sm text-slate-300">Rejected</p>
                <p className="mt-2 text-3xl font-semibold">
                  {rejectedBookings.length}
                </p>
              </div>
            </div>
          </div>
        </header>

        <section className="grid gap-8 xl:grid-cols-[1.2fr_0.8fr]">
          <div className="space-y-8">
            <div className="rounded-3xl bg-white p-6 shadow-sm ring-1 ring-slate-200 sm:p-8">
              <div className="mb-6">
                <h2 className="text-2xl font-semibold tracking-tight">
                  Pending requests
                </h2>
                <p className="mt-1 text-sm text-slate-500">
                  Review requests before confirming the final schedule.
                </p>
              </div>

              <div className="space-y-5">
                {pendingBookings.map((booking) => (
                  <article
                    key={booking.id}
                    className="rounded-2xl border border-slate-200 bg-slate-50 p-5"
                  >
                    <div className="flex flex-col gap-4">
                      <div className="flex flex-wrap items-center gap-2">
                        <span className="rounded-full bg-amber-100 px-3 py-1 text-xs font-medium text-amber-700">
                          {booking.status}
                        </span>
                        <span className="rounded-full bg-white px-3 py-1 text-xs font-semibold uppercase tracking-[0.2em] text-slate-500 ring-1 ring-slate-200">
                          {booking.resource.type}
                        </span>
                      </div>

                      <div>
                        <h3 className="text-xl font-semibold text-slate-900">
                          {booking.resource.name}
                        </h3>
                        <p className="mt-2 text-sm leading-6 text-slate-600">
                          {booking.purpose}
                        </p>
                      </div>

                      <div className="grid gap-3 text-sm text-slate-600 md:grid-cols-2">
                        <p>
                          <span className="font-medium text-slate-900">
                            Requested by:
                          </span>{" "}
                          {booking.requester.name}
                        </p>
                        <p>
                          <span className="font-medium text-slate-900">
                            Team:
                          </span>{" "}
                          {booking.team?.name ?? "No team"}
                        </p>
                        <p>
                          <span className="font-medium text-slate-900">
                            Start:
                          </span>{" "}
                          {formatDateTime(booking.startTime)}
                        </p>
                        <p>
                          <span className="font-medium text-slate-900">
                            End:
                          </span>{" "}
                          {formatDateTime(booking.endTime)}
                        </p>
                        <p>
                          <span className="font-medium text-slate-900">
                            Location:
                          </span>{" "}
                          {booking.resource.location}
                        </p>
                        <p>
                          <span className="font-medium text-slate-900">
                            Requested at:
                          </span>{" "}
                          {formatDateTime(booking.createdAt)}
                        </p>
                      </div>

                      <div className="grid gap-4 lg:grid-cols-2">
                        <form action={approveBooking} className="space-y-3">
                          <input
                            type="hidden"
                            name="bookingId"
                            value={booking.id}
                          />
                          <textarea
                            name="adminNote"
                            rows={3}
                            placeholder="Optional approval note"
                            className="w-full rounded-2xl border border-slate-300 bg-white px-4 py-3 text-sm outline-none transition focus:border-slate-900 focus:ring-2 focus:ring-slate-200"
                          />
                          <button
                            type="submit"
                            className="inline-flex w-full items-center justify-center rounded-2xl bg-emerald-600 px-4 py-3 text-sm font-semibold text-white transition hover:bg-emerald-700"
                          >
                            Approve booking
                          </button>
                        </form>

                        <form action={rejectBooking} className="space-y-3">
                          <input
                            type="hidden"
                            name="bookingId"
                            value={booking.id}
                          />
                          <textarea
                            name="adminNote"
                            rows={3}
                            placeholder="Reason for rejection"
                            className="w-full rounded-2xl border border-slate-300 bg-white px-4 py-3 text-sm outline-none transition focus:border-slate-900 focus:ring-2 focus:ring-slate-200"
                          />
                          <button
                            type="submit"
                            className="inline-flex w-full items-center justify-center rounded-2xl bg-rose-600 px-4 py-3 text-sm font-semibold text-white transition hover:bg-rose-700"
                          >
                            Reject booking
                          </button>
                        </form>
                      </div>
                    </div>
                  </article>
                ))}

                {pendingBookings.length === 0 ? (
                  <div className="rounded-2xl border border-dashed border-slate-300 bg-slate-50 p-6 text-sm text-slate-500">
                    No pending booking requests.
                  </div>
                ) : null}
              </div>
            </div>
          </div>

          <div className="space-y-8">
            <div className="rounded-3xl bg-white p-6 shadow-sm ring-1 ring-slate-200 sm:p-8">
              <h2 className="text-2xl font-semibold tracking-tight">
                Recently approved
              </h2>
              <p className="mt-1 text-sm text-slate-500">
                Approved reservations now visible in the active schedule.
              </p>

              <div className="mt-6 space-y-4">
                {approvedBookings.map((booking) => (
                  <article
                    key={booking.id}
                    className="rounded-2xl border border-slate-200 bg-slate-50 p-4"
                  >
                    <div className="flex items-start justify-between gap-3">
                      <div>
                        <h3 className="text-lg font-semibold text-slate-900">
                          {booking.resource.name}
                        </h3>
                        <p className="mt-1 text-sm text-slate-600">
                          {booking.requester.name}
                          {booking.team ? ` · ${booking.team.name}` : ""}
                        </p>
                      </div>
                      <span className="rounded-full bg-emerald-100 px-3 py-1 text-xs font-medium text-emerald-700">
                        APPROVED
                      </span>
                    </div>

                    <div className="mt-3 space-y-1 text-sm text-slate-600">
                      <p>{formatDateTime(booking.startTime)}</p>
                      <p>{formatDateTime(booking.endTime)}</p>
                      <p>{booking.adminNote ?? "No admin note."}</p>
                    </div>
                  </article>
                ))}

                {approvedBookings.length === 0 ? (
                  <div className="rounded-2xl border border-dashed border-slate-300 bg-slate-50 p-6 text-sm text-slate-500">
                    No approved bookings yet.
                  </div>
                ) : null}
              </div>
            </div>

            <div className="rounded-3xl bg-white p-6 shadow-sm ring-1 ring-slate-200 sm:p-8">
              <h2 className="text-2xl font-semibold tracking-tight">
                Recently rejected
              </h2>
              <p className="mt-1 text-sm text-slate-500">
                Rejected requests remain visible for audit and clarity.
              </p>

              <div className="mt-6 space-y-4">
                {rejectedBookings.map((booking) => (
                  <article
                    key={booking.id}
                    className="rounded-2xl border border-slate-200 bg-slate-50 p-4"
                  >
                    <div className="flex items-start justify-between gap-3">
                      <div>
                        <h3 className="text-lg font-semibold text-slate-900">
                          {booking.resource.name}
                        </h3>
                        <p className="mt-1 text-sm text-slate-600">
                          {booking.requester.name}
                          {booking.team ? ` · ${booking.team.name}` : ""}
                        </p>
                      </div>
                      <span className="rounded-full bg-rose-100 px-3 py-1 text-xs font-medium text-rose-700">
                        REJECTED
                      </span>
                    </div>

                    <div className="mt-3 space-y-1 text-sm text-slate-600">
                      <p>{formatDateTime(booking.startTime)}</p>
                      <p>{formatDateTime(booking.endTime)}</p>
                      <p>{booking.adminNote ?? "No rejection note."}</p>
                    </div>
                  </article>
                ))}

                {rejectedBookings.length === 0 ? (
                  <div className="rounded-2xl border border-dashed border-slate-300 bg-slate-50 p-6 text-sm text-slate-500">
                    No rejected bookings yet.
                  </div>
                ) : null}
              </div>
            </div>
          </div>
        </section>
      </section>
    </main>
  );
}