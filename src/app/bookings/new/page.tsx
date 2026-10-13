import { connection } from "next/server";
import { prisma } from "@/lib/prisma";
import { requireUser } from "@/lib/auth";
import NewBookingForm from "./NewBookingForm";

export const instant = false;

export default async function NewBookingPage() {
  await connection();

  await requireUser();

  const [resources, teams] = await Promise.all([
    prisma.resource.findMany({
      where: {
        status: "AVAILABLE",
      },
      orderBy: {
        name: "asc",
      },
    }),
    prisma.team.findMany({
      orderBy: {
        name: "asc",
      },
    }),
  ]);

  return (
    <main className="min-h-screen bg-slate-100 text-slate-900">
      <section className="mx-auto flex min-h-screen w-full max-w-3xl flex-col justify-center px-4 py-8 sm:px-6 lg:px-8">
        <div className="rounded-3xl bg-white p-6 shadow-sm ring-1 ring-slate-200 sm:p-8">
          <div className="mb-8">
            <p className="text-sm font-medium uppercase tracking-[0.2em] text-slate-500">
              Create reservation
            </p>
            <h1 className="mt-3 text-3xl font-bold tracking-tight text-slate-900">
              New booking request
            </h1>
            <p className="mt-3 text-sm leading-6 text-slate-600">
              Submit a request for a shared resource. Approved bookings with
              overlapping times will be blocked automatically.
            </p>
          </div>

          <NewBookingForm resources={resources} teams={teams} />
        </div>
      </section>
    </main>
  );
}