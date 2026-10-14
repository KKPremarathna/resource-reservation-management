"use client";

import { useState } from "react";

export type CalendarBooking = {
  id: string;
  startTime: string;
  endTime: string;
  status: string;
  purpose: string;
  resource: { name: string; type: string };
  requester: { name: string; email: string };
};

const STATUS_COLORS: Record<string, string> = {
  APPROVED: "bg-emerald-100 text-emerald-700 border-emerald-200",
  PENDING: "bg-amber-100 text-amber-700 border-amber-200",
  REJECTED: "bg-rose-100 text-rose-600 border-rose-200",
  CANCELLED: "bg-slate-100 text-slate-500 border-slate-200",
};

const MONTH_NAMES = [
  "January","February","March","April","May","June",
  "July","August","September","October","November","December",
];
const DAY_NAMES = ["Sun","Mon","Tue","Wed","Thu","Fri","Sat"];

function formatTime(iso: string) {
  return new Date(iso).toLocaleTimeString("en-LK", { timeStyle: "short" });
}

function formatDate(iso: string) {
  return new Date(iso).toLocaleDateString("en-LK", { dateStyle: "medium" });
}

export default function AdminCalendarView({
  bookings,
}: {
  bookings: CalendarBooking[];
}) {
  const today = new Date();
  const [year, setYear] = useState(today.getFullYear());
  const [month, setMonth] = useState(today.getMonth());
  const [selectedDay, setSelectedDay] = useState<number | null>(null);

  const daysInMonth = new Date(year, month + 1, 0).getDate();
  const firstDay = new Date(year, month, 1).getDay();
  const rows = Math.ceil((firstDay + daysInMonth) / 7);

  function prevMonth() {
    if (month === 0) { setMonth(11); setYear((y) => y - 1); }
    else setMonth((m) => m - 1);
    setSelectedDay(null);
  }
  function nextMonth() {
    if (month === 11) { setMonth(0); setYear((y) => y + 1); }
    else setMonth((m) => m + 1);
    setSelectedDay(null);
  }

  function getBookingsForDay(day: number) {
    return bookings.filter((b) => {
      const d = new Date(b.startTime);
      return d.getFullYear() === year && d.getMonth() === month && d.getDate() === day;
    });
  }

  const selectedDayBookings = selectedDay ? getBookingsForDay(selectedDay) : [];

  return (
    <div className="flex min-h-0 flex-1 flex-col gap-4 xl:flex-row">
      {/* ── Calendar Grid ── */}
      <div className="flex min-h-0 flex-1 flex-col rounded-2xl border border-slate-200 bg-white shadow-sm">
        {/* Header */}
        <div className="flex shrink-0 items-center justify-between border-b border-slate-100 px-5 py-3">
          <div>
            <h2 className="text-sm font-semibold text-slate-900">Booking Calendar</h2>
            <p className="text-xs text-slate-500">Click a day to view bookings</p>
          </div>
          <div className="flex items-center gap-2">
            <button
              onClick={prevMonth}
              className="flex h-7 w-7 items-center justify-center rounded-lg border border-slate-200 bg-white text-lg text-slate-600 hover:bg-slate-50 transition"
            >
              ‹
            </button>
            <span className="w-36 text-center text-sm font-semibold text-slate-800">
              {MONTH_NAMES[month]} {year}
            </span>
            <button
              onClick={nextMonth}
              className="flex h-7 w-7 items-center justify-center rounded-lg border border-slate-200 bg-white text-lg text-slate-600 hover:bg-slate-50 transition"
            >
              ›
            </button>
          </div>
        </div>

        {/* Day labels */}
        <div className="grid shrink-0 grid-cols-7 border-b border-slate-50 px-3">
          {DAY_NAMES.map((d) => (
            <div key={d} className="py-1.5 text-center text-[10px] font-semibold uppercase tracking-wider text-slate-400">
              {d}
            </div>
          ))}
        </div>

        {/* Day cells */}
        <div className="flex-1 overflow-y-auto px-3 py-2">
          <div className="grid grid-cols-7 gap-1" style={{ gridAutoRows: `calc((100%) / ${rows})` }}>
            {Array.from({ length: rows * 7 }).map((_, i) => {
              const day = i - firstDay + 1;
              const isValid = day >= 1 && day <= daysInMonth;
              const dayBookings = isValid ? getBookingsForDay(day) : [];
              const isToday =
                isValid &&
                day === today.getDate() &&
                month === today.getMonth() &&
                year === today.getFullYear();
              const isSelected = selectedDay === day && isValid;

              return (
                <div
                  key={i}
                  onClick={() => isValid && setSelectedDay(isSelected ? null : day)}
                  className={`min-h-12 rounded-lg p-1 transition ${
                    !isValid
                      ? "pointer-events-none opacity-0"
                      : isSelected
                      ? "cursor-pointer bg-indigo-50 ring-2 ring-indigo-400"
                      : "cursor-pointer hover:bg-slate-50"
                  }`}
                >
                  {isValid && (
                    <>
                      <p className="mb-0.5 flex justify-end">
                        <span
                          className={`flex h-5 w-5 items-center justify-center rounded-full text-[11px] font-semibold ${
                            isToday
                              ? "bg-indigo-600 text-white"
                              : "text-slate-700"
                          }`}
                        >
                          {day}
                        </span>
                      </p>
                      <div className="space-y-0.5">
                        {dayBookings.slice(0, 2).map((b) => (
                          <div
                            key={b.id}
                            className={`truncate rounded border px-1 py-px text-[9px] font-semibold ${
                              STATUS_COLORS[b.status] ?? STATUS_COLORS.CANCELLED
                            }`}
                          >
                            {b.resource.name}
                          </div>
                        ))}
                        {dayBookings.length > 2 && (
                          <p className="px-0.5 text-[9px] font-medium text-slate-400">
                            +{dayBookings.length - 2} more
                          </p>
                        )}
                      </div>
                    </>
                  )}
                </div>
              );
            })}
          </div>
        </div>

        {/* Legend */}
        <div className="shrink-0 flex items-center gap-3 border-t border-slate-50 px-5 py-2">
          {Object.entries(STATUS_COLORS).map(([status, cls]) => (
            <div key={status} className="flex items-center gap-1">
              <span className={`h-2.5 w-2.5 rounded-sm border ${cls}`} />
              <span className="text-[10px] font-medium text-slate-500">{status}</span>
            </div>
          ))}
        </div>
      </div>

      {/* ── Day Detail Panel ── */}
      <div className="flex min-h-0 flex-col rounded-2xl border border-slate-200 bg-white shadow-sm xl:w-72 xl:shrink-0">
        <div className="shrink-0 border-b border-slate-100 px-5 py-3">
          <h2 className="text-sm font-semibold text-slate-900">
            {selectedDay
              ? `${MONTH_NAMES[month]} ${selectedDay}, ${year}`
              : "Day Details"}
          </h2>
          <p className="text-xs text-slate-500">
            {selectedDay
              ? `${selectedDayBookings.length} booking${selectedDayBookings.length !== 1 ? "s" : ""}`
              : "Select a day to view bookings"}
          </p>
        </div>

        <div className="scroll-list flex-1 divide-y divide-slate-50 overflow-y-auto px-4 py-2">
          {!selectedDay && (
            <div className="flex flex-col items-center justify-center py-12 text-center">
              <div className="mb-2 flex h-10 w-10 items-center justify-center rounded-full bg-slate-100">
                <svg className="h-5 w-5 text-slate-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                </svg>
              </div>
              <p className="text-xs text-slate-400">Click any day on the calendar</p>
            </div>
          )}
          {selectedDay && selectedDayBookings.length === 0 && (
            <div className="py-10 text-center">
              <p className="text-sm font-medium text-slate-700">No bookings</p>
              <p className="mt-0.5 text-xs text-slate-400">This day is free</p>
            </div>
          )}
          {selectedDayBookings.map((b) => (
            <div key={b.id} className="py-3">
              <div className="flex items-start justify-between gap-2">
                <div className="min-w-0">
                  <p className="truncate text-sm font-semibold text-slate-900">{b.resource.name}</p>
                  <p className="text-[11px] text-slate-500">{b.resource.type}</p>
                </div>
                <span
                  className={`shrink-0 rounded-full border px-2 py-0.5 text-[10px] font-semibold ${
                    STATUS_COLORS[b.status] ?? STATUS_COLORS.CANCELLED
                  }`}
                >
                  {b.status}
                </span>
              </div>
              <p className="mt-1 text-xs text-slate-600">
                By <span className="font-medium text-slate-800">{b.requester.name}</span>
              </p>
              <p className="text-[11px] text-slate-400">{b.requester.email}</p>
              <div className="mt-1.5 rounded-lg bg-slate-50 px-2.5 py-2 text-xs text-slate-600">
                <p className="font-medium">
                  {formatTime(b.startTime)} → {formatTime(b.endTime)}
                </p>
                {b.purpose && (
                  <p className="mt-0.5 italic text-slate-400 line-clamp-2">{b.purpose}</p>
                )}
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
