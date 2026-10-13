import Link from "next/link";
import { connection } from "next/server";
import { prisma } from "@/lib/prisma";
import { requireUser } from "@/lib/auth";
import { logoutUser } from "@/app/login/actions";
import { createResource, updateResource } from "./actions";

export const instant = false;

function getStatusClasses(status: string) {
  if (status === "AVAILABLE") {
    return "bg-emerald-100 text-emerald-700";
  }

  if (status === "MAINTENANCE") {
    return "bg-amber-100 text-amber-700";
  }

  if (status === "INACTIVE") {
    return "bg-slate-200 text-slate-700";
  }

  return "bg-slate-200 text-slate-700";
}

export default async function AdminResourcesPage() {
  await connection();

  const currentUser = await requireUser();

  if (currentUser.role !== "ADMIN") {
    throw new Error("Only admins can access the resource management page.");
  }

  const resources = await prisma.resource.findMany({
    orderBy: [
      {
        name: "asc",
      },
    ],
  });

  const availableCount = resources.filter(
    (resource) => resource.status === "AVAILABLE",
  ).length;

  const maintenanceCount = resources.filter(
    (resource) => resource.status === "MAINTENANCE",
  ).length;

  const inactiveCount = resources.filter(
    (resource) => resource.status === "INACTIVE",
  ).length;

  return (
    <main className="min-h-screen bg-slate-100 text-slate-900">
      <section className="mx-auto flex w-full max-w-7xl flex-col gap-8 px-4 py-8 sm:px-6 lg:px-8">
        <header className="rounded-3xl bg-slate-900 px-6 py-8 text-white shadow-lg sm:px-8">
          <div className="flex flex-col gap-6 lg:flex-row lg:items-start lg:justify-between">
            <div className="space-y-3">
              <div className="flex flex-wrap items-center gap-3">
                <span className="inline-flex rounded-full bg-white/10 px-3 py-1 text-sm font-medium text-slate-200">
                  Admin Inventory
                </span>
                <span className="inline-flex rounded-full bg-cyan-500/15 px-3 py-1 text-sm font-medium text-cyan-200">
                  {currentUser.name}
                </span>
              </div>

              <div>
                <h1 className="text-4xl font-bold tracking-tight sm:text-5xl">
                  Resource management
                </h1>
                <p className="mt-3 max-w-2xl text-base leading-7 text-slate-300 sm:text-lg">
                  Add, review, and update the shared resources your teams can
                  reserve.
                </p>
              </div>
            </div>

            <div className="flex flex-wrap items-center gap-3">
              <Link
                href="/"
                className="inline-flex items-center justify-center rounded-2xl border border-white/15 px-4 py-2 text-sm font-semibold text-white transition hover:bg-white/10"
              >
                Dashboard
              </Link>

              <Link
                href="/admin/bookings"
                className="inline-flex items-center justify-center rounded-2xl border border-white/15 px-4 py-2 text-sm font-semibold text-white transition hover:bg-white/10"
              >
                Admin bookings
              </Link>

              <form action={logoutUser}>
                <button
                  type="submit"
                  className="inline-flex items-center justify-center rounded-2xl border border-rose-300/25 px-4 py-2 text-sm font-semibold text-rose-100 transition hover:bg-rose-500/10"
                >
                  Logout
                </button>
              </form>
            </div>
          </div>

          <div className="mt-8 grid grid-cols-2 gap-4 sm:grid-cols-4">
            <div className="rounded-2xl bg-white/10 p-4 backdrop-blur">
              <p className="text-sm text-slate-300">Total resources</p>
              <p className="mt-2 text-3xl font-semibold">{resources.length}</p>
            </div>

            <div className="rounded-2xl bg-white/10 p-4 backdrop-blur">
              <p className="text-sm text-slate-300">Available</p>
              <p className="mt-2 text-3xl font-semibold">{availableCount}</p>
            </div>

            <div className="rounded-2xl bg-white/10 p-4 backdrop-blur">
              <p className="text-sm text-slate-300">Maintenance</p>
              <p className="mt-2 text-3xl font-semibold">
                {maintenanceCount}
              </p>
            </div>

            <div className="rounded-2xl bg-white/10 p-4 backdrop-blur">
              <p className="text-sm text-slate-300">Inactive</p>
              <p className="mt-2 text-3xl font-semibold">{inactiveCount}</p>
            </div>
          </div>
        </header>

        <section className="grid gap-8 lg:grid-cols-[1.05fr_1.4fr]">
          <div className="rounded-3xl bg-white p-6 shadow-sm ring-1 ring-slate-200 sm:p-8">
            <div>
              <h2 className="text-2xl font-semibold tracking-tight">
                Add resource
              </h2>
              <p className="mt-1 text-sm text-slate-500">
                Create a new bookable room, facility, or shared asset.
              </p>
            </div>

            <form action={createResource} className="mt-6 space-y-5">
              <div className="space-y-2">
                <label
                  htmlFor="name"
                  className="text-sm font-semibold text-slate-900"
                >
                  Resource name
                </label>
                <input
                  id="name"
                  name="name"
                  type="text"
                  required
                  placeholder="Conference Room A"
                  className="w-full rounded-2xl border border-slate-300 bg-white px-4 py-3 text-sm text-slate-900 outline-none transition placeholder:text-slate-400 focus:border-slate-900 focus:ring-2 focus:ring-slate-900/10"
                />
              </div>

              <div className="grid gap-5 sm:grid-cols-2">
                <div className="space-y-2">
                  <label
                    htmlFor="type"
                    className="text-sm font-semibold text-slate-900"
                  >
                    Type
                  </label>
                  <select
                    id="type"
                    name="type"
                    required
                    defaultValue="FACILITY"
                    className="w-full rounded-2xl border border-slate-300 bg-white px-4 py-3 text-sm text-slate-900 outline-none transition focus:border-slate-900 focus:ring-2 focus:ring-slate-900/10"
                  >
                    <option value="FACILITY">FACILITY</option>
                    <option value="RESOURCE">RESOURCE</option>
                  </select>
                </div>

                <div className="space-y-2">
                  <label
                    htmlFor="location"
                    className="text-sm font-semibold text-slate-900"
                  >
                    Location
                  </label>
                  <input
                    id="location"
                    name="location"
                    type="text"
                    required
                    placeholder="First Floor"
                    className="w-full rounded-2xl border border-slate-300 bg-white px-4 py-3 text-sm text-slate-900 outline-none transition placeholder:text-slate-400 focus:border-slate-900 focus:ring-2 focus:ring-slate-900/10"
                  />
                </div>
              </div>

              <div className="grid gap-5 sm:grid-cols-2">
                <div className="space-y-2">
                  <label
                    htmlFor="capacity"
                    className="text-sm font-semibold text-slate-900"
                  >
                    Capacity
                  </label>
                  <input
                    id="capacity"
                    name="capacity"
                    type="number"
                    min={1}
                    placeholder="10"
                    className="w-full rounded-2xl border border-slate-300 bg-white px-4 py-3 text-sm text-slate-900 outline-none transition placeholder:text-slate-400 focus:border-slate-900 focus:ring-2 focus:ring-slate-900/10"
                  />
                </div>

                <div className="space-y-2">
                  <label
                    htmlFor="status"
                    className="text-sm font-semibold text-slate-900"
                  >
                    Status
                  </label>
                  <select
                    id="status"
                    name="status"
                    required
                    defaultValue="AVAILABLE"
                    className="w-full rounded-2xl border border-slate-300 bg-white px-4 py-3 text-sm text-slate-900 outline-none transition focus:border-slate-900 focus:ring-2 focus:ring-slate-900/10"
                  >
                    <option value="AVAILABLE">AVAILABLE</option>
                    <option value="MAINTENANCE">MAINTENANCE</option>
                    <option value="INACTIVE">INACTIVE</option>
                  </select>
                </div>
              </div>

              <div className="space-y-2">
                <label
                  htmlFor="description"
                  className="text-sm font-semibold text-slate-900"
                >
                  Description
                </label>
                <textarea
                  id="description"
                  name="description"
                  rows={4}
                  placeholder="Optional notes about capacity, equipment, or usage."
                  className="w-full rounded-2xl border border-slate-300 bg-white px-4 py-3 text-sm text-slate-900 outline-none transition placeholder:text-slate-400 focus:border-slate-900 focus:ring-2 focus:ring-slate-900/10"
                />
              </div>

              <button
                type="submit"
                className="inline-flex items-center justify-center rounded-2xl bg-slate-900 px-5 py-3 text-sm font-semibold text-white transition hover:bg-slate-800"
              >
                Create resource
              </button>
            </form>
          </div>

          <div className="rounded-3xl bg-white p-6 shadow-sm ring-1 ring-slate-200 sm:p-8">
            <div className="flex flex-col gap-2 sm:flex-row sm:items-end sm:justify-between">
              <div>
                <h2 className="text-2xl font-semibold tracking-tight">
                  Existing resources
                </h2>
                <p className="mt-1 text-sm text-slate-500">
                  Review the summary first, then open edit only when needed.
                </p>
              </div>

              <p className="text-sm text-slate-500">
                Signed in as{" "}
                <span className="font-medium text-slate-900">
                  {currentUser.email}
                </span>
              </p>
            </div>

            <div className="mt-6 space-y-5">
              {resources.map((resource) => (
                <article
                  key={resource.id}
                  className="rounded-2xl border border-slate-200 bg-slate-50 p-5"
                >
                  <div className="flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between">
                    <div className="min-w-0">
                      <div className="flex flex-wrap items-center gap-3">
                        <p className="text-xs font-semibold uppercase tracking-[0.2em] text-slate-500">
                          {resource.type}
                        </p>
                        <span
                          className={`rounded-full px-3 py-1 text-xs font-semibold ${getStatusClasses(
                            resource.status,
                          )}`}
                        >
                          {resource.status}
                        </span>
                      </div>

                      <h3 className="mt-3 text-xl font-semibold text-slate-900">
                        {resource.name}
                      </h3>

                      <div className="mt-3 grid gap-2 text-sm text-slate-600 sm:grid-cols-2">
                        <p>
                          <span className="font-medium text-slate-900">
                            Location:
                          </span>{" "}
                          {resource.location}
                        </p>
                        <p>
                          <span className="font-medium text-slate-900">
                            Capacity:
                          </span>{" "}
                          {resource.capacity ?? "Not set"}
                        </p>
                      </div>

                      <p className="mt-3 text-sm leading-6 text-slate-600">
                        {resource.description || "No description provided."}
                      </p>
                    </div>
                  </div>

                  <details className="mt-5 rounded-2xl border border-slate-200 bg-white">
                    <summary className="cursor-pointer list-none px-4 py-3 text-sm font-semibold text-slate-900 marker:hidden">
                      <span className="inline-flex items-center gap-2">
                        Edit resource
                      </span>
                    </summary>

                    <div className="border-t border-slate-200 px-4 py-4">
                      <form action={updateResource} className="space-y-4">
                        <input
                          type="hidden"
                          name="resourceId"
                          value={resource.id}
                        />

                        <div className="grid gap-4 sm:grid-cols-2">
                          <div className="space-y-2">
                            <label
                              htmlFor={`name-${resource.id}`}
                              className="text-sm font-semibold text-slate-900"
                            >
                              Name
                            </label>
                            <input
                              id={`name-${resource.id}`}
                              name="name"
                              type="text"
                              required
                              defaultValue={resource.name}
                              className="w-full rounded-2xl border border-slate-300 bg-white px-4 py-3 text-sm text-slate-900 outline-none transition focus:border-slate-900 focus:ring-2 focus:ring-slate-900/10"
                            />
                          </div>

                          <div className="space-y-2">
                            <label
                              htmlFor={`type-${resource.id}`}
                              className="text-sm font-semibold text-slate-900"
                            >
                              Type
                            </label>
                            <select
                              id={`type-${resource.id}`}
                              name="type"
                              required
                              defaultValue={resource.type}
                              className="w-full rounded-2xl border border-slate-300 bg-white px-4 py-3 text-sm text-slate-900 outline-none transition focus:border-slate-900 focus:ring-2 focus:ring-slate-900/10"
                            >
                              <option value="FACILITY">FACILITY</option>
                              <option value="RESOURCE">RESOURCE</option>
                            </select>
                          </div>
                        </div>

                        <div className="grid gap-4 sm:grid-cols-3">
                          <div className="space-y-2">
                            <label
                              htmlFor={`location-${resource.id}`}
                              className="text-sm font-semibold text-slate-900"
                            >
                              Location
                            </label>
                            <input
                              id={`location-${resource.id}`}
                              name="location"
                              type="text"
                              required
                              defaultValue={resource.location}
                              className="w-full rounded-2xl border border-slate-300 bg-white px-4 py-3 text-sm text-slate-900 outline-none transition focus:border-slate-900 focus:ring-2 focus:ring-slate-900/10"
                            />
                          </div>

                          <div className="space-y-2">
                            <label
                              htmlFor={`capacity-${resource.id}`}
                              className="text-sm font-semibold text-slate-900"
                            >
                              Capacity
                            </label>
                            <input
                              id={`capacity-${resource.id}`}
                              name="capacity"
                              type="number"
                              min={1}
                              defaultValue={resource.capacity ?? ""}
                              className="w-full rounded-2xl border border-slate-300 bg-white px-4 py-3 text-sm text-slate-900 outline-none transition focus:border-slate-900 focus:ring-2 focus:ring-slate-900/10"
                            />
                          </div>

                          <div className="space-y-2">
                            <label
                              htmlFor={`status-${resource.id}`}
                              className="text-sm font-semibold text-slate-900"
                            >
                              Status
                            </label>
                            <select
                              id={`status-${resource.id}`}
                              name="status"
                              required
                              defaultValue={resource.status}
                              className="w-full rounded-2xl border border-slate-300 bg-white px-4 py-3 text-sm text-slate-900 outline-none transition focus:border-slate-900 focus:ring-2 focus:ring-slate-900/10"
                            >
                              <option value="AVAILABLE">AVAILABLE</option>
                              <option value="MAINTENANCE">MAINTENANCE</option>
                              <option value="INACTIVE">INACTIVE</option>
                            </select>
                          </div>
                        </div>

                        <div className="space-y-2">
                          <label
                            htmlFor={`description-${resource.id}`}
                            className="text-sm font-semibold text-slate-900"
                          >
                            Description
                          </label>
                          <textarea
                            id={`description-${resource.id}`}
                            name="description"
                            rows={3}
                            defaultValue={resource.description ?? ""}
                            className="w-full rounded-2xl border border-slate-300 bg-white px-4 py-3 text-sm text-slate-900 outline-none transition focus:border-slate-900 focus:ring-2 focus:ring-slate-900/10"
                          />
                        </div>

                        <button
                          type="submit"
                          className="inline-flex items-center justify-center rounded-2xl border border-slate-300 bg-white px-4 py-2 text-sm font-semibold text-slate-900 transition hover:bg-slate-100"
                        >
                          Save changes
                        </button>
                      </form>
                    </div>
                  </details>
                </article>
              ))}

              {resources.length === 0 ? (
                <div className="rounded-2xl border border-dashed border-slate-300 bg-slate-50 px-6 py-12 text-center">
                  <h3 className="text-lg font-semibold text-slate-900">
                    No resources yet
                  </h3>
                  <p className="mx-auto mt-2 max-w-md text-sm leading-6 text-slate-500">
                    Add your first shared resource so users can start submitting
                    booking requests.
                  </p>
                </div>
              ) : null}
            </div>
          </div>
        </section>
      </section>
    </main>
  );
}