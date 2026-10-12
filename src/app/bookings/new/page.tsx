import Link from "next/link";
import { connection } from "next/server";
import { prisma } from "@/lib/prisma";
import { createBookingRequest } from "./actions";

export const instant = false;

type PageProps = {
  searchParams: Promise<{
    success?: string;
  }>;
};

function formatDateTimeLocal(date: Date) {
  const offset = date.getTimezoneOffset();
  const local = new Date(date.getTime() - offset * 60 * 1000);
  return local.toISOString().slice(0, 16);
}

export default async function NewBookingPage({ searchParams }: PageProps) {
  await connection();

  const params = await searchParams;

  const [resources, users, teams] = await Promise.all([
    prisma.resource.findMany({
      where: {
        status: "AVAILABLE",
      },
      orderBy: { name: "asc" },
    }),
    prisma.user.findMany({
      orderBy: { name: "asc" },
    }),
    prisma.team.findMany({
      include: {
        members: {
          include: {
            user: true,
          },
        },
      },
      orderBy: { name: "asc" },
    }),
  ]);

  const now = new Date();
  const oneHourLater = new Date(now.getTime() + 60 * 60 * 1000);

  return (
    <main className="min-h-screen bg-slate-100 text-slate-900">
      <section className="mx-auto flex w-full max-w-5xl flex-col gap-8 px-4 py-8 sm:px-6 lg:px-8">
        <header className="rounded-3xl bg-slate-900 px-6 py-8 text-white shadow-lg sm:px-8">
          <div className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
            <div className="space-y-3">
              <div className="flex flex-wrap items-center gap-3">
                <span className="inline-flex rounded-full bg-white/10 px-3 py-1 text-sm font-medium text-slate-200">
                  Booking Request
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
                  Request a reservation
                </h1>
                <p className="mt-3 max-w-2xl text-base leading-7 text-slate-300 sm:text-lg">
                  Select an available facility or resource and submit it for admin
                  approval.
                </p>
              </div>
            </div>
          </div>
        </header>

        {params.success === "1" ? (
          <div className="rounded-2xl border border-emerald-200 bg-emerald-50 px-5 py-4 text-sm font-medium text-emerald-700">
            Booking request submitted successfully. It is now pending admin
            approval.
          </div>
        ) : null}

        <section className="grid gap-8 lg:grid-cols-[1fr_0.9fr]">
          <div className="rounded-3xl bg-white p-6 shadow-sm ring-1 ring-slate-200 sm:p-8">
            <div className="mb-6">
              <h2 className="text-2xl font-semibold tracking-tight">
                New booking request
              </h2>
              <p className="mt-1 text-sm text-slate-500">
                Fill the booking details and submit the request.
              </p>
            </div>

            <form action={createBookingRequest} className="space-y-5">
              <div className="space-y-2">
                <label
                  htmlFor="resourceId"
                  className="text-sm font-medium text-slate-700"
                >
                  Resource or facility
                </label>
                <select
                  id="resourceId"
                  name="resourceId"
                  required
                  className="w-full rounded-2xl border border-slate-300 bg-white px-4 py-3 outline-none transition focus:border-slate-900 focus:ring-2 focus:ring-slate-200"
                >
                  <option value="">Select a resource</option>
                  {resources.map((resource) => (
                    <option key={resource.id} value={resource.id}>
                      {resource.name} · {resource.type} · {resource.location}
                    </option>
                  ))}
                </select>
              </div>

              <div className="grid gap-5 md:grid-cols-2">
                <div className="space-y-2">
                  <label
                    htmlFor="requesterId"
                    className="text-sm font-medium text-slate-700"
                  >
                    Requested by
                  </label>
                  <select
                    id="requesterId"
                    name="requesterId"
                    required
                    className="w-full rounded-2xl border border-slate-300 bg-white px-4 py-3 outline-none transition focus:border-slate-900 focus:ring-2 focus:ring-slate-200"
                  >
                    <option value="">Select a user</option>
                    {users.map((user) => (
                      <option key={user.id} value={user.id}>
                        {user.name} · {user.role}
                      </option>
                    ))}
                  </select>
                </div>

                <div className="space-y-2">
                  <label
                    htmlFor="teamId"
                    className="text-sm font-medium text-slate-700"
                  >
                    Team (optional)
                  </label>
                  <select
                    id="teamId"
                    name="teamId"
                    className="w-full rounded-2xl border border-slate-300 bg-white px-4 py-3 outline-none transition focus:border-slate-900 focus:ring-2 focus:ring-slate-200"
                  >
                    <option value="">No team</option>
                    {teams.map((team) => (
                      <option key={team.id} value={team.id}>
                        {team.name}
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              <div className="grid gap-5 md:grid-cols-2">
                <div className="space-y-2">
                  <label
                    htmlFor="startTime"
                    className="text-sm font-medium text-slate-700"
                  >
                    Start time
                  </label>
                  <input
                    id="startTime"
                    name="startTime"
                    type="datetime-local"
                    required
                    defaultValue={formatDateTimeLocal(now)}
                    className="w-full rounded-2xl border border-slate-300 bg-white px-4 py-3 outline-none transition focus:border-slate-900 focus:ring-2 focus:ring-slate-200"
                  />
                </div>

                <div className="space-y-2">
                  <label
                    htmlFor="endTime"
                    className="text-sm font-medium text-slate-700"
                  >
                    End time
                  </label>
                  <input
                    id="endTime"
                    name="endTime"
                    type="datetime-local"
                    required
                    defaultValue={formatDateTimeLocal(oneHourLater)}
                    className="w-full rounded-2xl border border-slate-300 bg-white px-4 py-3 outline-none transition focus:border-slate-900 focus:ring-2 focus:ring-slate-200"
                  />
                </div>
              </div>

              <div className="space-y-2">
                <label
                  htmlFor="purpose"
                  className="text-sm font-medium text-slate-700"
                >
                  Purpose
                </label>
                <textarea
                  id="purpose"
                  name="purpose"
                  rows={4}
                  required
                  placeholder="Weekly planning meeting for engineering team."
                  className="w-full rounded-2xl border border-slate-300 bg-white px-4 py-3 outline-none transition focus:border-slate-900 focus:ring-2 focus:ring-slate-200"
                />
              </div>

              <button
                type="submit"
                className="inline-flex w-full items-center justify-center rounded-2xl bg-slate-900 px-5 py-3 text-sm font-semibold text-white transition hover:bg-slate-800"
              >
                Submit booking request
              </button>
            </form>
          </div>

          <div className="space-y-8">
            <div className="rounded-3xl bg-white p-6 shadow-sm ring-1 ring-slate-200 sm:p-8">
              <h2 className="text-2xl font-semibold tracking-tight">
                Available resources
              </h2>
              <p className="mt-1 text-sm text-slate-500">
                Only currently available items can be requested.
              </p>

              <div className="mt-6 space-y-4">
                {resources.map((resource) => (
                  <article
                    key={resource.id}
                    className="rounded-2xl border border-slate-200 bg-slate-50 p-4"
                  >
                    <div className="flex items-start justify-between gap-3">
                      <div>
                        <h3 className="text-lg font-semibold text-slate-900">
                          {resource.name}
                        </h3>
                        <p className="mt-1 text-sm text-slate-600">
                          {resource.description ?? "No description provided."}
                        </p>
                      </div>
                      <span className="rounded-full bg-emerald-100 px-3 py-1 text-xs font-medium text-emerald-700">
                        {resource.type}
                      </span>
                    </div>

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

                {resources.length === 0 ? (
                  <div className="rounded-2xl border border-dashed border-slate-300 bg-slate-50 p-6 text-sm text-slate-500">
                    No available resources found.
                  </div>
                ) : null}
              </div>
            </div>

            <div className="rounded-3xl bg-white p-6 shadow-sm ring-1 ring-slate-200 sm:p-8">
              <h2 className="text-2xl font-semibold tracking-tight">Teams</h2>
              <p className="mt-1 text-sm text-slate-500">
                Team booking requests can later trigger notifications for members.
              </p>

              <div className="mt-6 space-y-4">
                {teams.map((team) => (
                  <article
                    key={team.id}
                    className="rounded-2xl border border-slate-200 bg-slate-50 p-4"
                  >
                    <h3 className="text-lg font-semibold text-slate-900">
                      {team.name}
                    </h3>
                    <p className="mt-3 text-sm font-medium text-slate-700">
                      Members
                    </p>
                    <div className="mt-2 flex flex-wrap gap-2">
                      {team.members.map((member) => (
                        <span
                          key={member.id}
                          className="rounded-full bg-white px-3 py-1 text-sm text-slate-600 ring-1 ring-slate-200"
                        >
                          {member.user.name}
                        </span>
                      ))}
                    </div>
                  </article>
                ))}

                {teams.length === 0 ? (
                  <div className="rounded-2xl border border-dashed border-slate-300 bg-slate-50 p-6 text-sm text-slate-500">
                    No teams found.
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