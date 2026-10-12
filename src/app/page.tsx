import { connection } from "next/server";
import { prisma } from "@/lib/prisma";

export const instant = false;

function formatDateTime(date: Date) {
  return new Intl.DateTimeFormat("en-LK", {
    dateStyle: "medium",
    timeStyle: "short",
  }).format(date);
}

export default async function HomePage() {
  await connection();

  const [resources, approvedBookings, pendingBookings] = await Promise.all([
    prisma.resource.findMany({
      orderBy: { createdAt: "desc" },
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
    prisma.booking.count({
      where: { status: "PENDING" },
    }),
  ]);

  return (
    <main className="min-h-screen bg-slate-100 text-slate-900">
      <section className="mx-auto flex min-h-screen w-full max-w-7xl flex-col gap-8 px-4 py-8 sm:px-6 lg:px-8">
        <header className="rounded-3xl bg-slate-900 px-6 py-8 text-white shadow-lg sm:px-8">
          <div className="flex flex-col gap-6 lg:flex-row lg:items-end lg:justify-between">
            <div className="max-w-2xl space-y-4">
              <span className="inline-flex rounded-full bg-white/10 px-3 py-1 text-sm font-medium text-slate-200">
                PrimeWave Lab Technical Assessment
              </span>
              <div className="space-y-3">
                <h1 className="text-4xl font-bold tracking-tight sm:text-5xl">
                  Reservify
                </h1>
                <p className="text-base leading-7 text-slate-300 sm:text-lg">
                  A resource reservation management system for shared facilities,
                  equipment, and team bookings.
                </p>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4 sm:grid-cols-3">
              <div className="rounded-2xl bg-white/10 p-4 backdrop-blur">
                <p className="text-sm text-slate-300">Resources</p>
                <p className="mt-2 text-3xl font-semibold">{resources.length}</p>
              </div>
              <div className="rounded-2xl bg-white/10 p-4 backdrop-blur">
                <p className="text-sm text-slate-300">Approved</p>
                <p className="mt-2 text-3xl font-semibold">
                  {approvedBookings.length}
                </p>
              </div>
              <div className="col-span-2 rounded-2xl bg-white/10 p-4 backdrop-blur sm:col-span-1">
                <p className="text-sm text-slate-300">Pending</p>
                <p className="mt-2 text-3xl font-semibold">{pendingBookings}</p>
              </div>
            </div>
          </div>
        </header>

        <section className="grid gap-8 lg:grid-cols-[1.2fr_0.8fr]">
          <div className="rounded-3xl bg-white p-6 shadow-sm ring-1 ring-slate-200 sm:p-8">
            <div className="mb-6 flex items-center justify-between">
              <div>
                <h2 className="text-2xl font-semibold tracking-tight">
                  Facilities and resources
                </h2>
                <p className="mt-1 text-sm text-slate-500">
                  Current inventory available in the system.
                </p>
              </div>
            </div>

            <div className="grid gap-4 md:grid-cols-2">
              {resources.map((resource) => (
                <article
                  key={resource.id}
                  className="rounded-2xl border border-slate-200 bg-slate-50 p-5"
                >
                  <div className="flex items-start justify-between gap-3">
                    <div>
                      <p className="text-xs font-semibold uppercase tracking-[0.2em] text-slate-500">
                        {resource.type}
                      </p>
                      <h3 className="mt-2 text-xl font-semibold text-slate-900">
                        {resource.name}
                      </h3>
                    </div>
                    <span
                      className={`rounded-full px-3 py-1 text-xs font-medium ${
                        resource.status === "AVAILABLE"
                          ? "bg-emerald-100 text-emerald-700"
                          : resource.status === "MAINTENANCE"
                            ? "bg-amber-100 text-amber-700"
                            : "bg-slate-200 text-slate-700"
                      }`}
                    >
                      {resource.status}
                    </span>
                  </div>

                  <p className="mt-3 text-sm leading-6 text-slate-600">
                    {resource.description ?? "No description provided."}
                  </p>

                  <div className="mt-4 flex flex-wrap gap-2 text-sm text-slate-500">
                    <span className="rounded-full bg-white px-3 py-1 ring-1 ring-slate-200">
                      {resource.location}
                    </span>
                    {resource.capacity ? (
                      <span className="rounded-full bg-white px-3 py-1 ring-1 ring-slate-200">
                        Capacity {resource.capacity}
                      </span>
                    ) : null}
                  </div>
                </article>
              ))}
            </div>
          </div>

          <div className="rounded-3xl bg-white p-6 shadow-sm ring-1 ring-slate-200 sm:p-8">
            <div>
              <h2 className="text-2xl font-semibold tracking-tight">
                Approved schedule
              </h2>
              <p className="mt-1 text-sm text-slate-500">
                Upcoming approved reservations for quick visibility.
              </p>
            </div>

            <div className="mt-6 space-y-4">
              {approvedBookings.map((booking) => (
                <article
                  key={booking.id}
                  className="rounded-2xl border border-slate-200 p-4"
                >
                  <div className="flex items-start justify-between gap-3">
                    <div>
                      <h3 className="text-lg font-semibold text-slate-900">
                        {booking.resource.name}
                      </h3>
                      <p className="mt-1 text-sm text-slate-600">
                        Requested by {booking.requester.name}
                        {booking.team ? ` · ${booking.team.name}` : ""}
                      </p>
                    </div>
                    <span className="rounded-full bg-emerald-100 px-3 py-1 text-xs font-medium text-emerald-700">
                      {booking.status}
                    </span>
                  </div>

                  <div className="mt-4 space-y-2 text-sm text-slate-600">
                    <p>
                      <span className="font-medium text-slate-900">Purpose:</span>{" "}
                      {booking.purpose}
                    </p>
                    <p>
                      <span className="font-medium text-slate-900">Start:</span>{" "}
                      {formatDateTime(booking.startTime)}
                    </p>
                    <p>
                      <span className="font-medium text-slate-900">End:</span>{" "}
                      {formatDateTime(booking.endTime)}
                    </p>
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
        </section>
      </section>
    </main>
  );
}