import Link from "next/link";
import { connection } from "next/server";
import { prisma } from "@/lib/prisma";
import { createResource, deleteResource } from "./actions";

export const instant = false;

export default async function AdminResourcesPage() {
  await connection();

  const resources = await prisma.resource.findMany({
    orderBy: { createdAt: "desc" },
  });

  return (
    <main className="min-h-screen bg-slate-100 text-slate-900">
      <section className="mx-auto flex w-full max-w-7xl flex-col gap-8 px-4 py-8 sm:px-6 lg:px-8">
        <header className="rounded-3xl bg-slate-900 px-6 py-8 text-white shadow-lg sm:px-8">
          <div className="flex flex-col gap-6 lg:flex-row lg:items-end lg:justify-between">
            <div className="space-y-3">
              <div className="flex flex-wrap items-center gap-3">
                <span className="inline-flex rounded-full bg-white/10 px-3 py-1 text-sm font-medium text-slate-200">
                  Admin Panel
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
                  Manage Resources
                </h1>
                <p className="mt-3 max-w-2xl text-base leading-7 text-slate-300 sm:text-lg">
                  Add, review, and remove facilities or shared resources used in
                  the reservation system.
                </p>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4 sm:grid-cols-2">
              <div className="rounded-2xl bg-white/10 p-4 backdrop-blur">
                <p className="text-sm text-slate-300">Total items</p>
                <p className="mt-2 text-3xl font-semibold">{resources.length}</p>
              </div>
              <div className="rounded-2xl bg-white/10 p-4 backdrop-blur">
                <p className="text-sm text-slate-300">Available</p>
                <p className="mt-2 text-3xl font-semibold">
                  {resources.filter((resource) => resource.status === "AVAILABLE").length}
                </p>
              </div>
            </div>
          </div>
        </header>

        <section className="grid gap-8 lg:grid-cols-[0.95fr_1.05fr]">
          <div className="rounded-3xl bg-white p-6 shadow-sm ring-1 ring-slate-200 sm:p-8">
            <div className="mb-6">
              <h2 className="text-2xl font-semibold tracking-tight">
                Add new resource
              </h2>
              <p className="mt-1 text-sm text-slate-500">
                Create a facility or equipment item for future reservations.
              </p>
            </div>

            <form action={createResource} className="space-y-5">
              <div className="space-y-2">
                <label
                  htmlFor="name"
                  className="text-sm font-medium text-slate-700"
                >
                  Name
                </label>
                <input
                  id="name"
                  name="name"
                  type="text"
                  required
                  placeholder="Conference Room B"
                  className="w-full rounded-2xl border border-slate-300 bg-white px-4 py-3 outline-none transition focus:border-slate-900 focus:ring-2 focus:ring-slate-200"
                />
              </div>

              <div className="space-y-2">
                <label
                  htmlFor="description"
                  className="text-sm font-medium text-slate-700"
                >
                  Description
                </label>
                <textarea
                  id="description"
                  name="description"
                  rows={4}
                  placeholder="Medium-sized meeting room with whiteboard and display."
                  className="w-full rounded-2xl border border-slate-300 bg-white px-4 py-3 outline-none transition focus:border-slate-900 focus:ring-2 focus:ring-slate-200"
                />
              </div>

              <div className="grid gap-5 md:grid-cols-2">
                <div className="space-y-2">
                  <label
                    htmlFor="type"
                    className="text-sm font-medium text-slate-700"
                  >
                    Type
                  </label>
                  <select
                    id="type"
                    name="type"
                    required
                    defaultValue="FACILITY"
                    className="w-full rounded-2xl border border-slate-300 bg-white px-4 py-3 outline-none transition focus:border-slate-900 focus:ring-2 focus:ring-slate-200"
                  >
                    <option value="FACILITY">Facility</option>
                    <option value="RESOURCE">Resource</option>
                  </select>
                </div>

                <div className="space-y-2">
                  <label
                    htmlFor="status"
                    className="text-sm font-medium text-slate-700"
                  >
                    Status
                  </label>
                  <select
                    id="status"
                    name="status"
                    required
                    defaultValue="AVAILABLE"
                    className="w-full rounded-2xl border border-slate-300 bg-white px-4 py-3 outline-none transition focus:border-slate-900 focus:ring-2 focus:ring-slate-200"
                  >
                    <option value="AVAILABLE">Available</option>
                    <option value="MAINTENANCE">Maintenance</option>
                    <option value="INACTIVE">Inactive</option>
                  </select>
                </div>
              </div>

              <div className="grid gap-5 md:grid-cols-2">
                <div className="space-y-2">
                  <label
                    htmlFor="location"
                    className="text-sm font-medium text-slate-700"
                  >
                    Location
                  </label>
                  <input
                    id="location"
                    name="location"
                    type="text"
                    required
                    placeholder="Level 3"
                    className="w-full rounded-2xl border border-slate-300 bg-white px-4 py-3 outline-none transition focus:border-slate-900 focus:ring-2 focus:ring-slate-200"
                  />
                </div>

                <div className="space-y-2">
                  <label
                    htmlFor="capacity"
                    className="text-sm font-medium text-slate-700"
                  >
                    Capacity
                  </label>
                  <input
                    id="capacity"
                    name="capacity"
                    type="number"
                    min="1"
                    placeholder="10"
                    className="w-full rounded-2xl border border-slate-300 bg-white px-4 py-3 outline-none transition focus:border-slate-900 focus:ring-2 focus:ring-slate-200"
                  />
                </div>
              </div>

              <button
                type="submit"
                className="inline-flex w-full items-center justify-center rounded-2xl bg-slate-900 px-5 py-3 text-sm font-semibold text-white transition hover:bg-slate-800"
              >
                Add resource
              </button>
            </form>
          </div>

          <div className="rounded-3xl bg-white p-6 shadow-sm ring-1 ring-slate-200 sm:p-8">
            <div className="mb-6">
              <h2 className="text-2xl font-semibold tracking-tight">
                Existing resources
              </h2>
              <p className="mt-1 text-sm text-slate-500">
                Review inventory and remove items that are no longer needed.
              </p>
            </div>

            <div className="space-y-4">
              {resources.map((resource) => (
                <article
                  key={resource.id}
                  className="rounded-2xl border border-slate-200 bg-slate-50 p-5"
                >
                  <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
                    <div className="space-y-3">
                      <div className="flex flex-wrap items-center gap-2">
                        <span className="rounded-full bg-white px-3 py-1 text-xs font-semibold uppercase tracking-[0.2em] text-slate-500 ring-1 ring-slate-200">
                          {resource.type}
                        </span>
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

                      <div>
                        <h3 className="text-xl font-semibold text-slate-900">
                          {resource.name}
                        </h3>
                        <p className="mt-2 text-sm leading-6 text-slate-600">
                          {resource.description ?? "No description provided."}
                        </p>
                      </div>

                      <div className="flex flex-wrap gap-2 text-sm text-slate-500">
                        <span className="rounded-full bg-white px-3 py-1 ring-1 ring-slate-200">
                          {resource.location}
                        </span>
                        {resource.capacity ? (
                          <span className="rounded-full bg-white px-3 py-1 ring-1 ring-slate-200">
                            Capacity {resource.capacity}
                          </span>
                        ) : null}
                      </div>
                    </div>

                    <form action={deleteResource}>
                      <input type="hidden" name="resourceId" value={resource.id} />
                      <button
                        type="submit"
                        className="inline-flex items-center justify-center rounded-2xl bg-rose-600 px-4 py-2 text-sm font-semibold text-white transition hover:bg-rose-700"
                      >
                        Delete
                      </button>
                    </form>
                  </div>
                </article>
              ))}

              {resources.length === 0 ? (
                <div className="rounded-2xl border border-dashed border-slate-300 bg-slate-50 p-6 text-sm text-slate-500">
                  No resources found.
                </div>
              ) : null}
            </div>
          </div>
        </section>
      </section>
    </main>
  );
}