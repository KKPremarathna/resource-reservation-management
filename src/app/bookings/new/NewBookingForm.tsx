"use client";

import { useActionState } from "react";
import { createBooking, type CreateBookingState } from "./actions";

type ResourceOption = {
  id: string;
  name: string;
  type: string;
  location: string;
};

type TeamOption = {
  id: string;
  name: string;
};

type NewBookingFormProps = {
  resources: ResourceOption[];
  teams: TeamOption[];
};

const initialState: CreateBookingState = {
  error: null,
};

export default function NewBookingForm({
  resources,
  teams,
}: NewBookingFormProps) {
  const [state, formAction, pending] = useActionState(
    createBooking,
    initialState,
  );

  return (
    <form action={formAction} className="space-y-6">
      <div className="space-y-2">
        <label
          htmlFor="resourceId"
          className="text-sm font-semibold text-slate-900"
        >
          Resource
        </label>
        <select
          id="resourceId"
          name="resourceId"
          required
          defaultValue=""
          className="w-full rounded-2xl border border-slate-300 bg-white px-4 py-3 text-sm text-slate-900 outline-none transition focus:border-slate-900 focus:ring-2 focus:ring-slate-900/10"
        >
          <option value="" disabled>
            Select a resource
          </option>
          {resources.map((resource) => (
            <option key={resource.id} value={resource.id}>
              {resource.name} · {resource.type} · {resource.location}
            </option>
          ))}
        </select>
      </div>

      <div className="space-y-2">
        <label
          htmlFor="teamId"
          className="text-sm font-semibold text-slate-900"
        >
          Team
        </label>
        <select
          id="teamId"
          name="teamId"
          defaultValue=""
          className="w-full rounded-2xl border border-slate-300 bg-white px-4 py-3 text-sm text-slate-900 outline-none transition focus:border-slate-900 focus:ring-2 focus:ring-slate-900/10"
        >
          <option value="">No team</option>
          {teams.map((team) => (
            <option key={team.id} value={team.id}>
              {team.name}
            </option>
          ))}
        </select>
      </div>

      <div className="space-y-2">
        <label
          htmlFor="purpose"
          className="text-sm font-semibold text-slate-900"
        >
          Purpose
        </label>
        <textarea
          id="purpose"
          name="purpose"
          required
          rows={4}
          placeholder="Explain why you need this resource"
          className="w-full rounded-2xl border border-slate-300 bg-white px-4 py-3 text-sm text-slate-900 outline-none transition placeholder:text-slate-400 focus:border-slate-900 focus:ring-2 focus:ring-slate-900/10"
        />
      </div>

      <div className="grid gap-6 sm:grid-cols-2">
        <div className="space-y-2">
          <label
            htmlFor="startTime"
            className="text-sm font-semibold text-slate-900"
          >
            Start time
          </label>
          <input
            id="startTime"
            name="startTime"
            type="datetime-local"
            required
            className="w-full rounded-2xl border border-slate-300 bg-white px-4 py-3 text-sm text-slate-900 outline-none transition focus:border-slate-900 focus:ring-2 focus:ring-slate-900/10"
          />
        </div>

        <div className="space-y-2">
          <label
            htmlFor="endTime"
            className="text-sm font-semibold text-slate-900"
          >
            End time
          </label>
          <input
            id="endTime"
            name="endTime"
            type="datetime-local"
            required
            className="w-full rounded-2xl border border-slate-300 bg-white px-4 py-3 text-sm text-slate-900 outline-none transition focus:border-slate-900 focus:ring-2 focus:ring-slate-900/10"
          />
        </div>
      </div>

      {state.error ? (
        <div
          className="rounded-2xl border border-rose-200 bg-rose-50 px-4 py-3 text-sm text-rose-700"
          aria-live="polite"
        >
          {state.error}
        </div>
      ) : null}

      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <p className="text-sm text-slate-500">
          Your request will be submitted for admin review.
        </p>

        <button
          type="submit"
          disabled={pending}
          className="inline-flex items-center justify-center rounded-2xl bg-slate-900 px-5 py-3 text-sm font-semibold text-white transition hover:bg-slate-800 disabled:cursor-not-allowed disabled:bg-slate-400"
        >
          {pending ? "Submitting..." : "Submit booking request"}
        </button>
      </div>
    </form>
  );
}
