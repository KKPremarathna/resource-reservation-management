import Link from "next/link";
import { connection } from "next/server";
import { prisma } from "@/lib/prisma";
import { requireUser } from "@/lib/auth";
import { logoutUser } from "@/app/login/actions";
import { createResource, updateResource } from "./actions";

export const instant = false;

function getStatusClasses(status: string) {
  if (status === "AVAILABLE")
    return "bg-emerald-50 text-emerald-700 ring-1 ring-emerald-200";
  if (status === "MAINTENANCE")
    return "bg-amber-50 text-amber-700 ring-1 ring-amber-200";
  if (status === "INACTIVE")
    return "bg-slate-100 text-slate-500 ring-1 ring-slate-200";
  return "bg-slate-100 text-slate-500 ring-1 ring-slate-200";
}

const fieldClass =
  "w-full rounded-xl border border-slate-300 bg-white px-4 py-2.5 text-sm text-slate-900 outline-none transition placeholder:text-slate-400 focus:border-indigo-500 focus:ring-3 focus:ring-indigo-500/15";

const labelClass = "block text-sm font-semibold text-slate-700";

export default async function AdminResourcesPage() {
  await connection();

  const currentUser = await requireUser();
  if (currentUser.role !== "ADMIN") {
    throw new Error("Only admins can access the resource management page.");
  }

  const resources = await prisma.resource.findMany({
    orderBy: [{ name: "asc" }],
  });

  const availableCount = resources.filter(
    (r) => r.status === "AVAILABLE",
  ).length;
  const maintenanceCount = resources.filter(
    (r) => r.status === "MAINTENANCE",
  ).length;
  const inactiveCount = resources.filter((r) => r.status === "INACTIVE").length;

  return (
    <div className="min-h-screen bg-slate-50">
      {/* ── Navbar ── */}
      <nav className="sticky top-0 z-30 border-b border-slate-200 bg-white/90 shadow-sm backdrop-blur-md">
        <div className="mx-auto flex max-w-7xl items-center justify-between px-4 py-3 sm:px-6 lg:px-8">
          <div className="flex items-center gap-3">
            <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-indigo-600">
              <svg
                className="h-4 w-4 text-white"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
                strokeWidth={2.5}
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  d="M6.75 3v2.25M17.25 3v2.25M3 18.75V7.5a2.25 2.25 0 0 1 2.25-2.25h13.5A2.25 2.25 0 0 1 21 7.5v11.25m-18 0A2.25 2.25 0 0 0 5.25 21h13.5A2.25 2.25 0 0 0 21 18.75m-18 0v-7.5A2.25 2.25 0 0 1 5.25 9h13.5A2.25 2.25 0 0 1 21 11.25v7.5"
                />
              </svg>
            </div>
            <Link
              href="/"
              className="text-base font-bold tracking-tight text-slate-900"
            >
              Reservify
            </Link>
            <span className="rounded-full bg-indigo-100 px-2 py-0.5 text-xs font-semibold text-indigo-700">
              Admin
            </span>
          </div>

          <div className="flex items-center gap-1">
            <Link href="/" className="rounded-lg px-3 py-2 text-sm font-medium text-slate-600 transition hover:bg-slate-100">Dashboard</Link>
            <Link href="/admin/calendar" className="rounded-lg px-3 py-2 text-sm font-medium text-slate-600 transition hover:bg-slate-100">Calendar</Link>
            <Link href="/admin/bookings" className="rounded-lg px-3 py-2 text-sm font-medium text-slate-600 transition hover:bg-slate-100">Review Bookings</Link>
            <Link href="/admin/resources" className="rounded-lg bg-indigo-50 px-3 py-2 text-sm font-semibold text-indigo-700 transition hover:bg-indigo-100">Resources</Link>
            <form action={logoutUser}>
              <button type="submit" className="rounded-lg border border-slate-200 bg-white px-3 py-1.5 text-sm font-medium text-slate-600 transition hover:bg-slate-50">
                Logout
              </button>
            </form>
          </div>
        </div>
      </nav>

      <main className="mx-auto max-w-7xl px-4 py-4 sm:px-6 lg:px-8">
        {/* Page header */}
        <div className="mb-4">
          <div className="flex flex-wrap items-center gap-2">
            <span className="rounded-full bg-slate-100 px-2.5 py-0.5 text-xs font-semibold text-slate-600">
              Admin Inventory
            </span>
            <span className="rounded-full bg-indigo-100 px-2.5 py-0.5 text-xs font-medium text-indigo-700">
              {currentUser.name}
            </span>
          </div>
          <h1 className="mt-3 text-2xl font-bold tracking-tight text-slate-900">
            Resource Management
          </h1>
          <p className="mt-1 text-sm text-slate-500">
            Add, review, and update the shared resources your teams can reserve.
          </p>
        </div>

        {/* Stat strip */}
        <div className="mb-4 grid grid-cols-2 gap-3 sm:grid-cols-4">
          {[
            { label: "Total", value: resources.length, color: "text-slate-900" },
            {
              label: "Available",
              value: availableCount,
              color: "text-emerald-600",
            },
            {
              label: "Maintenance",
              value: maintenanceCount,
              color: "text-amber-600",
            },
            {
              label: "Inactive",
              value: inactiveCount,
              color: "text-slate-400",
            },
          ].map((s) => (
            <div
              key={s.label}
              className="rounded-xl border border-slate-200 bg-white p-3 shadow-sm"
            >
              <p className="text-xs font-medium text-slate-500">{s.label}</p>
              <p className={`mt-1.5 text-2xl font-bold ${s.color}`}>{s.value}</p>
            </div>
          ))}
        </div>

        <div className="grid gap-6 lg:grid-cols-[1fr_1.5fr]">
          {/* ── Add Resource form ── */}
          <section className="rounded-2xl border border-slate-200 bg-white shadow-sm">
            <div className="border-b border-slate-100 px-6 py-4">
              <h2 className="text-base font-semibold text-slate-900">
                Add Resource
              </h2>
              <p className="mt-0.5 text-sm text-slate-500">
                Create a new bookable room, facility, or shared asset.
              </p>
            </div>

            <form action={createResource} className="space-y-5 px-6 py-5">
              <div className="space-y-1.5">
                <label htmlFor="name" className={labelClass}>
                  Resource name
                </label>
                <input
                  id="name"
                  name="name"
                  type="text"
                  required
                  placeholder="Conference Room A"
                  className={fieldClass}
                />
              </div>

              <div className="grid gap-4 sm:grid-cols-2">
                <div className="space-y-1.5">
                  <label htmlFor="type" className={labelClass}>
                    Type
                  </label>
                  <select
                    id="type"
                    name="type"
                    required
                    defaultValue="FACILITY"
                    className={fieldClass}
                  >
                    <option value="FACILITY">FACILITY</option>
                    <option value="RESOURCE">RESOURCE</option>
                  </select>
                </div>

                <div className="space-y-1.5">
                  <label htmlFor="location" className={labelClass}>
                    Location
                  </label>
                  <input
                    id="location"
                    name="location"
                    type="text"
                    required
                    placeholder="First Floor"
                    className={fieldClass}
                  />
                </div>
              </div>

              <div className="grid gap-4 sm:grid-cols-2">
                <div className="space-y-1.5">
                  <label htmlFor="capacity" className={labelClass}>
                    Capacity
                  </label>
                  <input
                    id="capacity"
                    name="capacity"
                    type="number"
                    min={1}
                    placeholder="10"
                    className={fieldClass}
                  />
                </div>

                <div className="space-y-1.5">
                  <label htmlFor="status" className={labelClass}>
                    Status
                  </label>
                  <select
                    id="status"
                    name="status"
                    required
                    defaultValue="AVAILABLE"
                    className={fieldClass}
                  >
                    <option value="AVAILABLE">AVAILABLE</option>
                    <option value="MAINTENANCE">MAINTENANCE</option>
                    <option value="INACTIVE">INACTIVE</option>
                  </select>
                </div>
              </div>

              <div className="space-y-1.5">
                <label htmlFor="description" className={labelClass}>
                  Description
                </label>
                <textarea
                  id="description"
                  name="description"
                  rows={3}
                  placeholder="Optional notes about capacity, equipment, or usage."
                  className={fieldClass}
                />
              </div>

              <button
                type="submit"
                className="w-full rounded-xl bg-indigo-600 py-2.5 text-sm font-semibold text-white shadow-sm transition hover:bg-indigo-700"
              >
                Create Resource
              </button>
            </form>
          </section>

          {/* ── Existing Resources ── */}
          <section className="rounded-2xl border border-slate-200 bg-white shadow-sm">
            <div className="flex items-center justify-between border-b border-slate-100 px-6 py-4">
              <div>
                <h2 className="text-base font-semibold text-slate-900">
                  Existing Resources
                </h2>
                <p className="mt-0.5 text-sm text-slate-500">
                  Review the summary first, then expand to edit.
                </p>
              </div>
              <p className="hidden text-xs text-slate-500 sm:block">
                {currentUser.email}
              </p>
            </div>

            <div className="scroll-list divide-y divide-slate-50 px-6 py-2" style={{maxHeight: '38rem'}}>
              {resources.map((resource) => (
                <article key={resource.id} className="py-3.5">
                  <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
                    <div className="min-w-0 flex-1">
                      <div className="flex flex-wrap items-center gap-2">
                        <span className="text-[11px] font-semibold uppercase tracking-widest text-slate-400">
                          {resource.type}
                        </span>
                        <span
                          className={`rounded-full px-2.5 py-0.5 text-[11px] font-semibold ${getStatusClasses(resource.status)}`}
                        >
                          {resource.status}
                        </span>
                      </div>
                      <h3 className="mt-1.5 text-base font-semibold text-slate-900">
                        {resource.name}
                      </h3>
                      <div className="mt-1.5 flex flex-wrap gap-3 text-xs text-slate-500">
                        <span>📍 {resource.location}</span>
                        <span>
                          👥 Capacity: {resource.capacity ?? "Not set"}
                        </span>
                      </div>
                      {resource.description && (
                        <p className="mt-2 text-sm leading-relaxed text-slate-600">
                          {resource.description}
                        </p>
                      )}
                    </div>
                  </div>

                  {/* Expandable edit form */}
                  <details className="mt-4 overflow-hidden rounded-xl border border-slate-200">
                    <summary className="cursor-pointer list-none px-4 py-3 text-sm font-semibold text-slate-700 transition hover:bg-slate-50 [&::-webkit-details-marker]:hidden">
                      <span className="flex items-center gap-2">
                        <svg
                          className="h-3.5 w-3.5 text-slate-400"
                          fill="none"
                          viewBox="0 0 24 24"
                          stroke="currentColor"
                        >
                          <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            strokeWidth={2}
                            d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z"
                          />
                        </svg>
                        Edit resource
                      </span>
                    </summary>

                    <div className="border-t border-slate-100 bg-slate-50 px-4 py-4">
                      <form action={updateResource} className="space-y-4">
                        <input
                          type="hidden"
                          name="resourceId"
                          value={resource.id}
                        />

                        <div className="grid gap-4 sm:grid-cols-2">
                          <div className="space-y-1.5">
                            <label
                              htmlFor={`name-${resource.id}`}
                              className={labelClass}
                            >
                              Name
                            </label>
                            <input
                              id={`name-${resource.id}`}
                              name="name"
                              type="text"
                              required
                              defaultValue={resource.name}
                              className={fieldClass}
                            />
                          </div>

                          <div className="space-y-1.5">
                            <label
                              htmlFor={`type-${resource.id}`}
                              className={labelClass}
                            >
                              Type
                            </label>
                            <select
                              id={`type-${resource.id}`}
                              name="type"
                              required
                              defaultValue={resource.type}
                              className={fieldClass}
                            >
                              <option value="FACILITY">FACILITY</option>
                              <option value="RESOURCE">RESOURCE</option>
                            </select>
                          </div>
                        </div>

                        <div className="grid gap-4 sm:grid-cols-3">
                          <div className="space-y-1.5">
                            <label
                              htmlFor={`location-${resource.id}`}
                              className={labelClass}
                            >
                              Location
                            </label>
                            <input
                              id={`location-${resource.id}`}
                              name="location"
                              type="text"
                              required
                              defaultValue={resource.location}
                              className={fieldClass}
                            />
                          </div>

                          <div className="space-y-1.5">
                            <label
                              htmlFor={`capacity-${resource.id}`}
                              className={labelClass}
                            >
                              Capacity
                            </label>
                            <input
                              id={`capacity-${resource.id}`}
                              name="capacity"
                              type="number"
                              min={1}
                              defaultValue={resource.capacity ?? ""}
                              className={fieldClass}
                            />
                          </div>

                          <div className="space-y-1.5">
                            <label
                              htmlFor={`status-${resource.id}`}
                              className={labelClass}
                            >
                              Status
                            </label>
                            <select
                              id={`status-${resource.id}`}
                              name="status"
                              required
                              defaultValue={resource.status}
                              className={fieldClass}
                            >
                              <option value="AVAILABLE">AVAILABLE</option>
                              <option value="MAINTENANCE">MAINTENANCE</option>
                              <option value="INACTIVE">INACTIVE</option>
                            </select>
                          </div>
                        </div>

                        <div className="space-y-1.5">
                          <label
                            htmlFor={`description-${resource.id}`}
                            className={labelClass}
                          >
                            Description
                          </label>
                          <textarea
                            id={`description-${resource.id}`}
                            name="description"
                            rows={3}
                            defaultValue={resource.description ?? ""}
                            className={fieldClass}
                          />
                        </div>

                        <button
                          type="submit"
                          className="rounded-xl border border-indigo-200 bg-white px-5 py-2 text-sm font-semibold text-indigo-700 transition hover:bg-indigo-50"
                        >
                          Save changes
                        </button>
                      </form>
                    </div>
                  </details>
                </article>
              ))}

              {resources.length === 0 && (
                <div className="py-16 text-center">
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
                        d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10"
                      />
                    </svg>
                  </div>
                  <p className="text-sm font-semibold text-slate-800">
                    No resources yet
                  </p>
                  <p className="mt-1 text-sm text-slate-500">
                    Add your first shared resource so users can start booking.
                  </p>
                </div>
              )}
            </div>
          </section>
        </div>
      </main>
    </div>
  );
}