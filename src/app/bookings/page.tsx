import Link from "next/link";
import { connection } from "next/server";
import { prisma } from "@/lib/prisma";
import { requireUser } from "@/lib/auth";
import Navbar from "@/components/Navbar";
import { cancelBooking } from "./actions";
import BookingCalendar from "./BookingCalendar";

export const instant = false;

function formatDateTime(date: Date) {
  return new Intl.DateTimeFormat("en-LK", {
    dateStyle: "medium",
    timeStyle: "short",
  }).format(date);
}

function getStatusClasses(status: string) {
  if (status === "APPROVED") return "bg-emerald-50 text-emerald-700 ring-1 ring-emerald-200";
  if (status === "PENDING") return "bg-amber-50 text-amber-700 ring-1 ring-amber-200";
  if (status === "REJECTED") return "bg-rose-50 text-rose-700 ring-1 ring-rose-200";
  if (status === "CANCELLED") return "bg-slate-100 text-slate-500 ring-1 ring-slate-200";
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

  // Serialize bookings for the client calendar component
  const calendarBookings = bookings.map((b) => ({
    id: b.id,
    startTime: b.startTime.toISOString(),
    endTime: b.endTime.toISOString(),
    status: b.status,
    purpose: b.purpose,
    resourceName: b.resource.name,
    resourceLocation: b.resource.location,
  }));

  return (
    <div className="flex h-screen flex-col overflow-hidden bg-slate-50">
      {/* ── Navbar ── */}
      <Navbar user={currentUser} activePath="/bookings" />

      <main className="mx-auto flex w-full max-w-7xl flex-1 flex-col overflow-hidden px-4 pb-4 pt-4 sm:px-6 lg:px-8">
        {/* ── Page header + stats ── */}
        <div className="mb-4 flex shrink-0 flex-col gap-3 border-b border-slate-200 pb-4 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <h1 className="text-xl font-bold tracking-tight text-slate-900">My Bookings</h1>
            <p className="text-sm text-slate-500">Your reservation requests and approval status</p>
          </div>
          {/* Stat chips */}
          <div className="flex flex-wrap items-center gap-2">
            {[
              { label: "Total", value: bookings.length },
              { label: "Approved", value: approvedCount },
              { label: "Pending", value: pendingCount },
              { label: "Rejected/Cancelled", value: rejectedOrCancelledCount },
            ].map((s) => (
              <div key={s.label} className="flex items-center gap-2 rounded-lg border border-slate-200 bg-white px-3 py-1.5 shadow-sm">
                <span className="text-xs font-medium text-slate-500">{s.label}:</span>
                <span className="text-sm font-bold text-slate-900">{s.value}</span>
              </div>
            ))}
          </div>
        </div>

        {/* ── Two-column fill ── */}
        <div className="flex min-h-0 flex-1 gap-4 xl:flex-row flex-col">
          {/* Left: Booking Timeline */}
          <section className="flex min-h-0 flex-1 flex-col rounded-2xl border border-slate-200 bg-white shadow-sm xl:flex-[3]">
            <div className="shrink-0 flex items-center justify-between border-b border-slate-100 px-5 py-3">
              <div>
                <h2 className="text-sm font-semibold text-slate-900">Request Timeline</h2>
                <p className="text-xs text-slate-500">Latest reservation requests appear first</p>
              </div>
              <span className="text-[11px] text-slate-400">
                Signed in as <span className="font-medium text-slate-600">{currentUser.email}</span>
              </span>
            </div>

            <div className="scroll-list flex-1 divide-y divide-slate-50 overflow-y-auto px-5 py-1">
              {bookings.map((booking) => (
                <article key={booking.id} className="py-3">
                  <div className="flex flex-col gap-3 lg:flex-row lg:items-start lg:justify-between">
                    <div className="min-w-0 flex-1">
                      <div className="flex flex-wrap items-center gap-1.5">
                        <span className="text-[10px] font-semibold uppercase tracking-widest text-slate-400">
                          {booking.resource.type}
                        </span>
                        <span className={`rounded-full px-2 py-0.5 text-[10px] font-semibold ${getStatusClasses(booking.status)}`}>
                          {booking.status}
                        </span>
                      </div>
                      <h3 className="mt-1 text-sm font-semibold text-slate-900">{booking.resource.name}</h3>
                      <p className="line-clamp-1 text-xs leading-relaxed text-slate-600">{booking.purpose}</p>
                    </div>

                    <div className="shrink-0 rounded-lg border border-slate-100 bg-slate-50 px-2.5 py-2 text-xs text-slate-600 lg:min-w-52">
                      <p><span className="font-semibold text-slate-700">Start:</span> {formatDateTime(booking.startTime)}</p>
                      <p className="mt-0.5"><span className="font-semibold text-slate-700">End:</span> {formatDateTime(booking.endTime)}</p>
                      <p className="mt-0.5"><span className="font-semibold text-slate-700">Location:</span> {booking.resource.location}</p>
                      {booking.team && <p className="mt-0.5"><span className="font-semibold text-slate-700">Team:</span> {booking.team.name}</p>}
                    </div>
                  </div>

                  {booking.adminNote && (
                    <div className="mt-2 rounded-lg border border-slate-200 bg-slate-50 px-3 py-2">
                      <p className="text-[10px] font-semibold uppercase tracking-widest text-slate-400">Admin Note</p>
                      <p className="mt-0.5 text-xs leading-relaxed text-slate-700">{booking.adminNote}</p>
                    </div>
                  )}

                  {booking.status === "PENDING" && (
                    <form action={cancelBooking} className="mt-2">
                      <input type="hidden" name="bookingId" value={booking.id} />
                      <button
                        type="submit"
                        className="rounded-lg border border-rose-200 bg-white px-3 py-1.5 text-xs font-semibold text-rose-600 transition hover:bg-rose-50 hover:border-rose-300"
                      >
                        Cancel request
                      </button>
                    </form>
                  )}
                </article>
              ))}

              {bookings.length === 0 && (
                <div className="flex flex-col items-center justify-center py-16 text-center">
                  <div className="mx-auto mb-3 flex h-12 w-12 items-center justify-center rounded-full bg-slate-100">
                    <svg className="h-5 w-5 text-slate-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                    </svg>
                  </div>
                  <h3 className="text-sm font-semibold text-slate-800">No booking requests yet</h3>
                  <p className="mt-1 max-w-sm text-xs text-slate-500">
                    Create your first reservation to reserve a facility or shared resource.
                  </p>
                  <Link
                    href="/bookings/new"
                    className="mt-4 inline-flex items-center rounded-xl bg-indigo-600 px-4 py-2 text-sm font-semibold text-white transition hover:bg-indigo-700"
                  >
                    Create Booking
                  </Link>
                </div>
              )}
            </div>
          </section>

          {/* Right: Calendar */}
          <div className="flex min-h-0 flex-col xl:flex-[2]">
            <BookingCalendar bookings={calendarBookings} />
          </div>
        </div>
      </main>
    </div>
  );
}