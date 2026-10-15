import { connection } from "next/server";
import { prisma } from "@/lib/prisma";
import { requireAdmin } from "@/lib/auth";
import Navbar from "@/components/Navbar";
import { updateBookingStatus } from "./actions";

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
  return "bg-slate-100 text-slate-500 ring-1 ring-slate-200";
}

export default async function AdminBookingsPage() {
  await connection();

  const currentUser = await requireAdmin();

  const bookings = await prisma.booking.findMany({
    include: {
      requester: { select: { id: true, name: true, email: true } },
      resource: true,
      team: true,
    },
    orderBy: [{ status: "asc" }, { startTime: "asc" }],
  });

  const pendingBookings = bookings.filter((b) => b.status === "PENDING");
  const reviewedBookings = bookings.filter((b) => b.status !== "PENDING");

  return (
    <div className="min-h-screen bg-slate-50">
      {/* ── Navbar ── */}
      <Navbar user={currentUser} activePath="/admin/bookings" />

      <main className="mx-auto max-w-7xl px-4 py-4 sm:px-6 lg:px-8">
        {/* Page header */}
        <div className="mb-4">
          <div className="flex flex-wrap items-center gap-2">
            <span className="rounded-full bg-emerald-100 px-2.5 py-0.5 text-xs font-semibold text-emerald-700">
              Admin Workspace
            </span>
            <span className="rounded-full bg-slate-100 px-2.5 py-0.5 text-xs font-medium text-slate-600">
              {currentUser.name}
            </span>
          </div>
          <h1 className="mt-3 text-2xl font-bold tracking-tight text-slate-900">
            Booking Review
          </h1>
          <p className="mt-1 text-sm text-slate-500">
            Review pending resource requests and record an approval decision.
          </p>
        </div>

        {/* Stat strip */}
        <div className="mb-4 grid grid-cols-3 gap-3">
          {[
            {
              label: "Pending Review",
              value: pendingBookings.length,
              accent: "text-amber-600",
            },
            {
              label: "Reviewed",
              value: reviewedBookings.length,
              accent: "text-emerald-600",
            },
            { label: "Total", value: bookings.length, accent: "text-indigo-600" },
          ].map((s) => (
            <div
              key={s.label}
              className="rounded-xl border border-slate-200 bg-white p-3 shadow-sm"
            >
              <p className="text-xs font-medium text-slate-500">{s.label}</p>
              <p className={`mt-1.5 text-2xl font-bold ${s.accent}`}>
                {s.value}
              </p>
            </div>
          ))}
        </div>

        {/* Pending requests */}
        <section className="mb-6 rounded-2xl border border-slate-200 bg-white shadow-sm">
          <div className="border-b border-slate-100 px-6 py-4">
            <h2 className="text-base font-semibold text-slate-900">
              Pending Requests
            </h2>
            <p className="mt-0.5 text-sm text-slate-500">
              Approve only when the resource is available for the full requested
              time range.
            </p>
          </div>

          <div className="scroll-list divide-y divide-slate-50 px-6 py-2" style={{maxHeight: '36rem'}}>
            {pendingBookings.map((booking) => (
              <article key={booking.id} className="py-4">
                <div className="grid gap-6 xl:grid-cols-[1fr_22rem]">
                  <div>
                    <div className="flex flex-wrap items-center gap-2">
                      <span
                        className={`rounded-full px-2.5 py-0.5 text-[11px] font-semibold ${getStatusClasses(booking.status)}`}
                      >
                        {booking.status}
                      </span>
                      <span className="text-[11px] font-semibold uppercase tracking-widest text-slate-400">
                        {booking.resource.type}
                      </span>
                    </div>

                    <h3 className="mt-3 text-base font-semibold text-slate-900">
                      {booking.resource.name}
                    </h3>
                    <p className="mt-1 text-sm leading-relaxed text-slate-600">
                      {booking.purpose}
                    </p>

                    <dl className="mt-4 grid gap-3 text-sm text-slate-600 sm:grid-cols-2">
                      <div>
                        <dt className="text-xs font-semibold uppercase tracking-wider text-slate-400">
                          Requested by
                        </dt>
                        <dd className="mt-1 font-medium text-slate-800">
                          {booking.requester.name}
                          <span className="block text-xs font-normal text-slate-500">
                            {booking.requester.email}
                          </span>
                        </dd>
                      </div>
                      <div>
                        <dt className="text-xs font-semibold uppercase tracking-wider text-slate-400">
                          Team
                        </dt>
                        <dd className="mt-1 text-slate-700">
                          {booking.team?.name ?? "No team selected"}
                        </dd>
                      </div>
                      <div>
                        <dt className="text-xs font-semibold uppercase tracking-wider text-slate-400">
                          Start
                        </dt>
                        <dd className="mt-1 text-slate-700">
                          {formatDateTime(booking.startTime)}
                        </dd>
                      </div>
                      <div>
                        <dt className="text-xs font-semibold uppercase tracking-wider text-slate-400">
                          End
                        </dt>
                        <dd className="mt-1 text-slate-700">
                          {formatDateTime(booking.endTime)}
                        </dd>
                      </div>
                      <div>
                        <dt className="text-xs font-semibold uppercase tracking-wider text-slate-400">
                          Location
                        </dt>
                        <dd className="mt-1 text-slate-700">
                          {booking.resource.location}
                        </dd>
                      </div>
                    </dl>
                  </div>

                  {/* Decision form */}
                  <form
                    action={updateBookingStatus}
                    className="rounded-xl border border-slate-200 bg-slate-50 p-4"
                  >
                    <input
                      type="hidden"
                      name="bookingId"
                      value={booking.id}
                    />
                    <label
                      htmlFor={`admin-note-${booking.id}`}
                      className="block text-sm font-semibold text-slate-800"
                    >
                      Admin note
                    </label>
                    <textarea
                      id={`admin-note-${booking.id}`}
                      name="adminNote"
                      rows={4}
                      placeholder="Optional decision note for the requester"
                      className="mt-2 w-full rounded-xl border border-slate-300 bg-white px-3 py-2 text-sm text-slate-900 outline-none transition placeholder:text-slate-400 focus:border-indigo-500 focus:ring-3 focus:ring-indigo-500/15"
                    />
                    <div className="mt-4 grid grid-cols-2 gap-3">
                      <button
                        type="submit"
                        name="status"
                        value="APPROVED"
                        className="rounded-xl bg-emerald-600 py-2.5 text-sm font-semibold text-white transition hover:bg-emerald-700"
                      >
                        ✓ Approve
                      </button>
                      <button
                        type="submit"
                        name="status"
                        value="REJECTED"
                        className="rounded-xl bg-rose-600 py-2.5 text-sm font-semibold text-white transition hover:bg-rose-700"
                      >
                        ✕ Reject
                      </button>
                    </div>
                  </form>
                </div>
              </article>
            ))}

            {pendingBookings.length === 0 && (
              <div className="py-12 text-center">
                <div className="mx-auto mb-3 flex h-12 w-12 items-center justify-center rounded-full bg-emerald-100">
                  <svg
                    className="h-5 w-5 text-emerald-600"
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M5 13l4 4L19 7"
                    />
                  </svg>
                </div>
                <p className="text-sm font-semibold text-slate-800">
                  All caught up!
                </p>
                <p className="mt-1 text-sm text-slate-500">
                  No pending requests. New ones will appear here.
                </p>
              </div>
            )}
          </div>
        </section>

        {/* Reviewed table */}
        <section className="rounded-2xl border border-slate-200 bg-white shadow-sm">
          <div className="border-b border-slate-100 px-6 py-4">
            <h2 className="text-base font-semibold text-slate-900">
              Recent Decisions
            </h2>
            <p className="mt-0.5 text-sm text-slate-500">
              The most recently reviewed bookings.
            </p>
          </div>

          <div className="scroll-list overflow-x-auto" style={{maxHeight: '28rem'}}>
            <table className="min-w-full divide-y divide-slate-100 text-left text-sm">
              <thead>
                <tr className="bg-slate-50">
                  {["Resource", "Requester", "Time", "Status", "Admin Note"].map(
                    (col) => (
                      <th
                        key={col}
                        className="px-5 py-3 text-xs font-semibold uppercase tracking-wider text-slate-500"
                      >
                        {col}
                      </th>
                    ),
                  )}
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-50 bg-white">
                {reviewedBookings.map((booking) => (
                  <tr
                    key={booking.id}
                    className="transition hover:bg-slate-50"
                  >
                    <td className="px-5 py-4 font-medium text-slate-900">
                      {booking.resource.name}
                    </td>
                    <td className="px-5 py-4">
                      <p className="font-medium text-slate-800">
                        {booking.requester.name}
                      </p>
                      <p className="text-xs text-slate-500">
                        {booking.requester.email}
                      </p>
                    </td>
                    <td className="px-5 py-4 text-slate-600">
                      <p>{formatDateTime(booking.startTime)}</p>
                      <p className="text-xs text-slate-400">
                        to {formatDateTime(booking.endTime)}
                      </p>
                    </td>
                    <td className="px-5 py-4">
                      <span
                        className={`inline-flex rounded-full px-2.5 py-0.5 text-[11px] font-semibold ${getStatusClasses(booking.status)}`}
                      >
                        {booking.status}
                      </span>
                    </td>
                    <td className="max-w-xs px-5 py-4 text-slate-600">
                      {booking.adminNote ?? (
                        <span className="text-slate-300">—</span>
                      )}
                    </td>
                  </tr>
                ))}
                {reviewedBookings.length === 0 && (
                  <tr>
                    <td
                      colSpan={5}
                      className="px-5 py-10 text-center text-sm text-slate-400"
                    >
                      No bookings have been reviewed yet.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </section>
      </main>
    </div>
  );
}