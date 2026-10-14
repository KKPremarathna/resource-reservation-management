import Link from "next/link";
import { connection } from "next/server";
import { redirect } from "next/navigation";
import { prisma } from "@/lib/prisma";
import { requireUser } from "@/lib/auth";
import { logoutUser } from "@/app/login/actions";
import AdminCalendarView from "./CalendarView";

export const instant = false;

export default async function AdminCalendarPage() {
  await connection();

  const currentUser = await requireUser();
  if (currentUser.role !== "ADMIN") redirect("/");

  const bookings = await prisma.booking.findMany({
    include: {
      requester: { select: { name: true, email: true } },
      resource: { select: { name: true, type: true } },
    },
    orderBy: { startTime: "asc" },
  });

  const serialized = bookings.map((b) => ({
    id: b.id,
    startTime: b.startTime.toISOString(),
    endTime: b.endTime.toISOString(),
    status: b.status,
    purpose: b.purpose,
    resource: b.resource,
    requester: b.requester,
  }));

  return (
    <div className="flex h-screen flex-col overflow-hidden bg-slate-50">
      {/* ── Navbar ── */}
      <nav className="shrink-0 border-b border-slate-200 bg-white/90 shadow-sm backdrop-blur-md">
        <div className="mx-auto flex max-w-7xl items-center justify-between px-4 py-3 sm:px-6 lg:px-8">
          <div className="flex items-center gap-3">
            <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-indigo-600">
              <svg className="h-4 w-4 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M6.75 3v2.25M17.25 3v2.25M3 18.75V7.5a2.25 2.25 0 0 1 2.25-2.25h13.5A2.25 2.25 0 0 1 21 7.5v11.25m-18 0A2.25 2.25 0 0 0 5.25 21h13.5A2.25 2.25 0 0 0 21 18.75m-18 0v-7.5A2.25 2.25 0 0 1 5.25 9h13.5A2.25 2.25 0 0 1 21 11.25v7.5" />
              </svg>
            </div>
            <Link href="/" className="text-base font-bold tracking-tight text-slate-900">Reservify</Link>
            <span className="rounded-full bg-indigo-100 px-2 py-0.5 text-xs font-semibold text-indigo-700">Admin</span>
          </div>

          <div className="flex items-center gap-1">
            <Link href="/" className="rounded-lg px-3 py-2 text-sm font-medium text-slate-600 transition hover:bg-slate-100">Dashboard</Link>
            <Link href="/admin/calendar" className="rounded-lg bg-indigo-50 px-3 py-2 text-sm font-semibold text-indigo-700 transition hover:bg-indigo-100">Calendar</Link>
            <Link href="/admin/bookings" className="rounded-lg px-3 py-2 text-sm font-medium text-slate-600 transition hover:bg-slate-100">Review Bookings</Link>
            <Link href="/admin/resources" className="rounded-lg px-3 py-2 text-sm font-medium text-slate-600 transition hover:bg-slate-100">Resources</Link>
            <form action={logoutUser}>
              <button type="submit" className="rounded-lg border border-slate-200 bg-white px-3 py-1.5 text-sm font-medium text-slate-600 transition hover:bg-slate-50">
                Logout
              </button>
            </form>
          </div>
        </div>
      </nav>

      {/* ── Main ── */}
      <main className="mx-auto flex w-full max-w-7xl flex-1 flex-col overflow-hidden px-4 pb-4 pt-4 sm:px-6 lg:px-8">
        {/* Page header */}
        <div className="mb-4 flex shrink-0 items-center justify-between border-b border-slate-200 pb-4">
          <div>
            <h1 className="text-xl font-bold tracking-tight text-slate-900">Booking Calendar</h1>
            <p className="text-sm text-slate-500">
              Visual overview of all resource bookings · {bookings.length} total
            </p>
          </div>
          <div className="flex items-center gap-2">
            <span className="flex items-center gap-1.5 rounded-lg border border-slate-200 bg-white px-3 py-1.5 text-xs font-medium text-slate-600">
              <span className="h-2 w-2 rounded-full bg-amber-400" /> Pending: {bookings.filter(b => b.status === "PENDING").length}
            </span>
            <span className="flex items-center gap-1.5 rounded-lg border border-slate-200 bg-white px-3 py-1.5 text-xs font-medium text-slate-600">
              <span className="h-2 w-2 rounded-full bg-emerald-500" /> Approved: {bookings.filter(b => b.status === "APPROVED").length}
            </span>
          </div>
        </div>

        <AdminCalendarView bookings={serialized} />
      </main>
    </div>
  );
}
