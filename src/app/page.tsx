import Link from "next/link";
import { connection } from "next/server";
import { prisma } from "@/lib/prisma";
import { requireUser } from "@/lib/auth";
import Navbar from "@/components/Navbar";

export const instant = false;

function formatDateTime(date: Date) {
  return new Intl.DateTimeFormat("en-LK", {
    dateStyle: "medium",
    timeStyle: "short",
  }).format(date);
}

function getBookingStatusClasses(status: string) {
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

function getResourceStatusClasses(status: string) {
  if (status === "AVAILABLE")
    return "bg-emerald-50 text-emerald-700 ring-1 ring-emerald-200";
  if (status === "MAINTENANCE")
    return "bg-amber-50 text-amber-700 ring-1 ring-amber-200";
  if (status === "INACTIVE")
    return "bg-slate-100 text-slate-500 ring-1 ring-slate-200";
  return "bg-slate-100 text-slate-500 ring-1 ring-slate-200";
}

export default async function HomePage() {
  await connection();

  const currentUser = await requireUser();

  const [
    totalResources,
    availableResources,
    totalBookings,
    userBookings,
    pendingApprovals,
    myPendingBookings,
    recentBookings,
    resources,
  ] = await Promise.all([
    prisma.resource.count(),
    prisma.resource.count({ where: { status: "AVAILABLE" } }),
    prisma.booking.count(),
    prisma.booking.count({ where: { requesterId: currentUser.id } }),
    currentUser.role === "ADMIN"
      ? prisma.booking.count({ where: { status: "PENDING" } })
      : Promise.resolve(0),
    prisma.booking.count({
      where: { requesterId: currentUser.id, status: "PENDING" },
    }),
    prisma.booking.findMany({
      where:
        currentUser.role === "ADMIN"
          ? undefined
          : { requesterId: currentUser.id },
      include: { resource: true, requester: true },
      orderBy: { createdAt: "desc" },
      take: 5,
    }),
    prisma.resource.findMany({
      orderBy: { updatedAt: "desc" },
      take: 5,
    }),
  ]);

  return (
    <div className="flex h-screen flex-col overflow-hidden bg-slate-50">
      {/* ── Navbar ── */}
      <Navbar user={currentUser} activePath="/" />

      <main className="mx-auto flex w-full max-w-7xl flex-1 flex-col overflow-hidden px-4 pb-4 pt-4 sm:px-6 lg:px-8">
        {/* ── Minimal Dashboard Header ── */}
        <div className="mb-4 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between border-b border-slate-200 pb-4">
          <div>
            <h1 className="text-xl font-bold tracking-tight text-slate-900">
              Welcome back, {currentUser.name}
            </h1>
            <p className="text-sm text-slate-500">
              Overview of resources and booking activities.
            </p>
          </div>

          {/* Stat Chips */}
          <div className="flex flex-wrap items-center gap-2">
            {[
              {
                label: "Resources",
                value: totalResources,
              },
              {
                label: "Available",
                value: availableResources,
              },
              {
                label: "My Bookings",
                value: userBookings,
              },
              {
                label: currentUser.role === "ADMIN" ? "Pending" : "Total",
                value: currentUser.role === "ADMIN" ? pendingApprovals : totalBookings,
              },
            ].map((stat) => (
              <div
                key={stat.label}
                className="flex items-center gap-2 rounded-lg border border-slate-200 bg-white px-3 py-1.5 shadow-xs"
              >
                <span className="text-xs font-medium text-slate-500">{stat.label}:</span>
                <span className="text-sm font-semibold text-slate-900">{stat.value}</span>
              </div>
            ))}
          </div>
        </div>

        {/* ── Main Grid ── */}
        <div className="flex min-h-0 flex-1 flex-col gap-4 xl:flex-row">
          {/* Recent Activity */}
          <section className="flex min-h-0 flex-1 flex-col rounded-2xl border border-slate-200 bg-white shadow-sm xl:flex-[3]">
            <div className="flex items-center justify-between border-b border-slate-100 px-5 py-3">
              <div>
                <h2 className="text-sm font-semibold text-slate-900">
                  Recent Activity
                </h2>
                <p className="text-xs text-slate-500">
                  Latest booking requests &amp; status updates
                </p>
              </div>
              <Link
                href={
                  currentUser.role === "ADMIN" ? "/admin/bookings" : "/bookings"
                }
                className="text-xs font-semibold text-indigo-600 transition hover:text-indigo-700"
              >
                View all →
              </Link>
            </div>

            <div className="scroll-list flex-1 divide-y divide-slate-50 overflow-y-auto px-5 py-1">
              {recentBookings.length > 0 ? (
                recentBookings.map((booking) => (
                  <article key={booking.id} className="py-3">
                    <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
                      <div className="min-w-0 flex-1">
                        <div className="flex flex-wrap items-center gap-2">
                          <span className="text-[11px] font-semibold uppercase tracking-widest text-slate-400">
                            {booking.resource.type}
                          </span>
                          <span
                            className={`rounded-full px-2.5 py-0.5 text-[11px] font-semibold ${getBookingStatusClasses(booking.status)}`}
                          >
                            {booking.status}
                          </span>
                        </div>
                        <h3 className="mt-1.5 text-sm font-semibold text-slate-900">
                          {booking.resource.name}
                        </h3>
                        <p className="mt-0.5 text-xs text-slate-500">
                          {booking.resource.location}
                        </p>
                        <p className="mt-1.5 line-clamp-2 text-sm text-slate-600">
                          {booking.purpose}
                        </p>
                        {currentUser.role === "ADMIN" && (
                          <p className="mt-1 text-xs text-slate-500">
                            By{" "}
                            <span className="font-medium text-slate-700">
                              {booking.requester.name}
                            </span>
                          </p>
                        )}
                      </div>
                      <div className="shrink-0 rounded-xl border border-slate-100 bg-slate-50 px-3 py-2 text-xs text-slate-600 sm:min-w-48">
                        <p>
                          <span className="font-medium text-slate-800">
                            Start:
                          </span>{" "}
                          {formatDateTime(booking.startTime)}
                        </p>
                        <p className="mt-1">
                          <span className="font-medium text-slate-800">
                            End:
                          </span>{" "}
                          {formatDateTime(booking.endTime)}
                        </p>
                        <p className="mt-1">
                          <span className="font-medium text-slate-800">
                            Created:
                          </span>{" "}
                          {formatDateTime(booking.createdAt)}
                        </p>
                      </div>
                    </div>
                  </article>
                ))
              ) : (
                <div className="py-12 text-center">
                  <div className="mx-auto mb-3 flex h-12 w-12 items-center justify-center rounded-full bg-slate-100">
                    <svg
                      className="h-5 w-5 text-slate-400"
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
                  <p className="text-sm font-semibold text-slate-800">
                    No booking activity yet
                  </p>
                  <p className="mt-1 text-sm text-slate-500">
                    Create a booking request to get started.
                  </p>
                </div>
              )}
            </div>
          </section>

          {/* Right column */}
          <div className="flex min-h-0 flex-col gap-3 xl:flex-[2]">
            {/* Quick Actions */}
            <section className="rounded-2xl border border-slate-200 bg-white shadow-sm">
              <div className="border-b border-slate-100 px-5 py-3">
                <h2 className="text-sm font-semibold text-slate-900">
                  Quick Actions
                </h2>
                <p className="text-xs text-slate-500">
                  Common tasks at a glance
                </p>
              </div>

              <div className="divide-y divide-slate-50">
                {currentUser.role === "ADMIN" ? (
                  <>
                    <Link href="/admin/calendar" className="flex items-center gap-3 px-5 py-2.5 transition hover:bg-slate-50">
                      <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-indigo-50 text-indigo-600">
                        <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                          <path strokeLinecap="round" strokeLinejoin="round" d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                        </svg>
                      </div>
                      <div>
                        <p className="text-sm font-semibold text-slate-900">Booking Calendar</p>
                        <p className="text-xs text-slate-500">View all reservations by date</p>
                      </div>
                    </Link>
                    <Link href="/admin/bookings" className="flex items-center gap-3 px-5 py-2.5 transition hover:bg-slate-50">
                      <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-amber-50 text-amber-600">
                        <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                          <path strokeLinecap="round" strokeLinejoin="round" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                        </svg>
                      </div>
                      <div>
                        <p className="text-sm font-semibold text-slate-900">Review pending requests</p>
                        <p className="text-xs text-slate-500">Approve or reject bookings</p>
                      </div>
                    </Link>
                    <Link href="/admin/resources" className="flex items-center gap-3 px-5 py-2.5 transition hover:bg-slate-50">
                      <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-emerald-50 text-emerald-600">
                        <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                          <path strokeLinecap="round" strokeLinejoin="round" d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10" />
                        </svg>
                      </div>
                      <div>
                        <p className="text-sm font-semibold text-slate-900">Manage resources</p>
                        <p className="text-xs text-slate-500">Update inventory &amp; availability</p>
                      </div>
                    </Link>
                  </>
                ) : (
                  <>
                    <Link href="/bookings/new" className="flex items-center gap-3 px-5 py-2.5 transition hover:bg-slate-50">
                      <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-indigo-50 text-indigo-600">
                        <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                          <path strokeLinecap="round" strokeLinejoin="round" d="M12 4v16m8-8H4" />
                        </svg>
                      </div>
                      <div>
                        <p className="text-sm font-semibold text-slate-900">Create a new booking</p>
                        <p className="text-xs text-slate-500">Submit a reservation request</p>
                      </div>
                    </Link>
                    <Link href="/bookings" className="flex items-center gap-3 px-5 py-2.5 transition hover:bg-slate-50">
                      <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-slate-100 text-slate-600">
                        <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                          <path strokeLinecap="round" strokeLinejoin="round" d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
                        </svg>
                      </div>
                      <div>
                        <p className="text-sm font-semibold text-slate-900">Review my bookings</p>
                        <p className="text-xs text-slate-500">Check statuses &amp; notes</p>
                      </div>
                    </Link>
                  </>
                )}
              </div>
            </section>

            {/* Resource Snapshot */}
            <section className="flex min-h-0 flex-1 flex-col rounded-2xl border border-slate-200 bg-white shadow-sm">
              <div className="flex items-center justify-between border-b border-slate-100 px-5 py-3">
                <div>
                  <h2 className="text-sm font-semibold text-slate-900">
                    Resource Snapshot
                  </h2>
                  <p className="text-xs text-slate-500">
                    Recently updated resources
                  </p>
                </div>
                {currentUser.role === "ADMIN" && (
                  <Link
                    href="/admin/resources"
                    className="text-sm font-semibold text-indigo-600 transition hover:text-indigo-700"
                  >
                    Manage →
                  </Link>
                )}
              </div>

              <div className="scroll-list flex-1 divide-y divide-slate-50 overflow-y-auto px-5 py-1">
                {resources.length > 0 ? (
                  resources.map((resource) => (
                    <article
                      key={resource.id}
                      className="flex items-start justify-between gap-3 py-2.5"
                    >
                      <div className="min-w-0">
                        <p className="text-sm font-semibold text-slate-900">
                          {resource.name}
                        </p>
                        <p className="mt-0.5 text-xs text-slate-500">
                          {resource.type} · {resource.location}
                        </p>
                        <p className="mt-0.5 text-xs text-slate-400">
                          Capacity: {resource.capacity ?? "Not set"}
                        </p>
                      </div>
                      <span
                        className={`shrink-0 rounded-full px-2.5 py-0.5 text-[11px] font-semibold ${getResourceStatusClasses(resource.status)}`}
                      >
                        {resource.status}
                      </span>
                    </article>
                  ))
                ) : (
                  <div className="py-10 text-center">
                    <p className="text-sm font-medium text-slate-700">
                      No resources yet
                    </p>
                    <p className="mt-1 text-xs text-slate-500">
                      Add shared resources to start accepting bookings.
                    </p>
                  </div>
                )}
              </div>
            </section>
          </div>
        </div>
      </main>
    </div>
  );
}