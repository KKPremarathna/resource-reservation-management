import { connection } from "next/server";
import { prisma } from "@/lib/prisma";
import { requireAdmin } from "@/lib/auth";
import Navbar from "@/components/Navbar";
import AdminCalendarView from "./CalendarView";

export const instant = false;

export default async function AdminCalendarPage() {
  await connection();

  const currentUser = await requireAdmin();

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
      <Navbar user={currentUser} activePath="/admin/calendar" />

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
