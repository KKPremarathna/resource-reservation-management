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

const fieldClass =
  "w-full rounded-xl border border-slate-300 bg-white px-4 py-2.5 text-sm text-slate-900 outline-none transition placeholder:text-slate-400 focus:border-indigo-500 focus:ring-3 focus:ring-indigo-500/15";

const labelClass = "block text-sm font-semibold text-slate-700";

export default function NewBookingForm({
  resources,
  teams,
}: NewBookingFormProps) {
  const [state, formAction, pending] = useActionState(
    createBooking,
    initialState,
  );

  return (
    <form action={formAction} className="space-y-5">
      {/* Resource */}
      <div className="space-y-1.5">
        <label htmlFor="resourceId" className={labelClass}>
          Resource
        </label>
        <select
          id="resourceId"
          name="resourceId"
          required
          defaultValue=""
          className={fieldClass}
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

      {/* Team */}
      <div className="space-y-1.5">
        <label htmlFor="teamId" className={labelClass}>
          Team{" "}
          <span className="text-xs font-normal text-slate-400">(optional)</span>
        </label>
        <select
          id="teamId"
          name="teamId"
          defaultValue=""
          className={fieldClass}
        >
          <option value="">No team</option>
          {teams.map((team) => (
            <option key={team.id} value={team.id}>
              {team.name}
            </option>
          ))}
        </select>
      </div>

      {/* Purpose */}
      <div className="space-y-1.5">
        <label htmlFor="purpose" className={labelClass}>
          Purpose
        </label>
        <textarea
          id="purpose"
          name="purpose"
          required
          rows={4}
          placeholder="Explain why you need this resource"
          className={fieldClass}
        />
      </div>

      {/* Times */}
      <div className="grid gap-5 sm:grid-cols-2">
        <div className="space-y-1.5">
          <label htmlFor="startTime" className={labelClass}>
            Start time
          </label>
          <input
            id="startTime"
            name="startTime"
            type="datetime-local"
            required
            className={fieldClass}
          />
        </div>

        <div className="space-y-1.5">
          <label htmlFor="endTime" className={labelClass}>
            End time
          </label>
          <input
            id="endTime"
            name="endTime"
            type="datetime-local"
            required
            className={fieldClass}
          />
        </div>
      </div>

      {/* Error */}
      {state.error && (
        <div
          className="flex items-center gap-2 rounded-xl border border-rose-200 bg-rose-50 px-4 py-3"
          aria-live="polite"
        >
          <svg
            className="h-4 w-4 shrink-0 text-rose-500"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z"
            />
          </svg>
          <p className="text-sm text-rose-700">{state.error}</p>
        </div>
      )}

      {/* Footer */}
      <div className="flex flex-col gap-3 border-t border-slate-100 pt-4 sm:flex-row sm:items-center sm:justify-between">
        <p className="text-xs text-slate-500">
          Your request will be submitted for admin review.
        </p>
        <button
          type="submit"
          disabled={pending}
          className="rounded-xl bg-indigo-600 px-6 py-2.5 text-sm font-semibold text-white shadow-sm transition hover:bg-indigo-700 disabled:cursor-not-allowed disabled:opacity-60"
        >
          {pending ? "Submitting…" : "Submit booking request"}
        </button>
      </div>
    </form>
  );
}
