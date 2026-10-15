import { connection } from "next/server";
import { redirect } from "next/navigation";
import { prisma } from "@/lib/prisma";
import { requireUser } from "@/lib/auth";
import Navbar from "@/components/Navbar";
import NewBookingForm from "./NewBookingForm";

export const instant = false;

export default async function NewBookingPage() {
  await connection();

  const currentUser = await requireUser();

  // Admins manage resources — they do not create bookings
  if (currentUser.role === "ADMIN") redirect("/admin/resources");

  const [resources, teams] = await Promise.all([
    prisma.resource.findMany({
      where: { status: "AVAILABLE" },
      orderBy: { name: "asc" },
    }),
    prisma.team.findMany({ orderBy: { name: "asc" } }),
  ]);

  return (
    <div className="min-h-screen bg-slate-50">
      {/* ── Navbar ── */}
      <Navbar user={currentUser} activePath="/bookings/new" />

      <main className="mx-auto max-w-2xl px-4 py-10 sm:px-6 lg:px-8">
        {/* Page header */}
        <div className="mb-6">
          <span className="inline-block rounded-full bg-indigo-100 px-2.5 py-0.5 text-xs font-semibold text-indigo-700">
            Create Reservation
          </span>
          <h1 className="mt-3 text-2xl font-bold tracking-tight text-slate-900">
            New Booking Request
          </h1>
          <p className="mt-1 text-sm text-slate-500">
            Submit a request for a shared resource. Approved bookings with
            overlapping times will be blocked automatically.
          </p>
        </div>

        <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm sm:p-8">
          <NewBookingForm resources={resources} teams={teams} />
        </div>

        {resources.length === 0 && (
          <div className="mt-4 rounded-xl border border-amber-200 bg-amber-50 px-4 py-3 text-sm text-amber-700">
            No available resources at the moment. Please check back later or
            contact your admin.
          </div>
        )}
      </main>
    </div>
  );
}