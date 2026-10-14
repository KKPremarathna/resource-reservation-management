"use client";

import { useState } from "react";

export type UserBookingEvent = {
  id: string;
  startTime: string;
  endTime: string;
  status: string;
  purpose: string;
  resourceName: string;
  resourceLocation: string;
};

const STATUS_DOT: Record<string, string> = {
  APPROVED: "bg-emerald-500",
  PENDING: "bg-amber-400",
  REJECTED: "bg-rose-500",
  CANCELLED: "bg-slate-300",
};

const STATUS_PILL: Record<string, string> = {
  APPROVED: "bg-emerald-50 text-emerald-700 ring-1 ring-emerald-200",
  PENDING: "bg-amber-50 text-amber-700 ring-1 ring-amber-200",
  REJECTED: "bg-rose-50 text-rose-700 ring-1 ring-rose-200",
  CANCELLED: "bg-slate-100 text-slate-500 ring-1 ring-slate-200",
};

const MONTH_NAMES = [
  "January","February","March","April","May","June",
  "July","August","September","October","November","December",
];
const DAY_NAMES = ["S","M","T","W","T","F","S"];

export default function BookingCalendar({ bookings }: { bookings: UserBookingEvent[] }) {
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
    <div className="flex min-h-0 flex-1 flex-col rounded-2xl border border-slate-200 bg-white shadow-sm">
      {/* Header */}
      <div className="shrink-0 flex items-center justify-between border-b border-slate-100 px-5 py-3">
        <h2 className="text-sm font-semibold text-slate-900">My Booking Calendar</h2>
        <div className="flex items-center gap-1">
          <button
            onClick={prevMonth}
            className="flex h-6 w-6 items-center justify-center rounded-md border border-slate-200 text-slate-500 hover:bg-slate-50 transition text-sm"
          >‹</button>
          <span className="min-w-28 text-center text-xs font-semibold text-slate-700">
            {MONTH_NAMES[month]} {year}
          </span>
          <button
            onClick={nextMonth}
            className="flex h-6 w-6 items-center justify-center rounded-md border border-slate-200 text-slate-500 hover:bg-slate-50 transition text-sm"
          >›</button>
        </div>
      </div>

      {/* Day labels */}
      <div className="grid shrink-0 grid-cols-7 border-b border-slate-50 px-3">
        {DAY_NAMES.map((d, i) => (
          <div key={i} className="py-1 text-center text-[9px] font-semibold uppercase tracking-wider text-slate-400">
            {d}
          </div>
        ))}
      </div>

      {/* Cells */}
      <div className="flex-1 overflow-y-auto px-2 pb-2 pt-1">
        <div className="grid grid-cols-7 gap-px">
          {Array.from({ length: rows * 7 }).map((_, i) => {
            const day = i - firstDay + 1;
            const isValid = day >= 1 && day <= daysInMonth;
            const dayBookings = isValid ? getBookingsForDay(day) : [];
            const isToday =
              isValid && day === today.getDate() && month === today.getMonth() && year === today.getFullYear();
            const isSelected = selectedDay === day && isValid;
            const hasDot = dayBookings.length > 0;

            return (
              <div
                key={i}
                onClick={() => isValid && setSelectedDay(isSelected ? null : day)}
                className={`h-8 rounded-md flex flex-col items-center justify-center transition ${
                  !isValid
                    ? "pointer-events-none"
                    : isSelected
                    ? "cursor-pointer bg-indigo-600"
                    : isToday
                    ? "cursor-pointer bg-indigo-50"
                    : "cursor-pointer hover:bg-slate-50"
                }`}
              >
                {isValid && (
                  <>
                    <span className={`text-[11px] font-semibold leading-none ${
                      isSelected ? "text-white" : isToday ? "text-indigo-600" : "text-slate-700"
                    }`}>
                      {day}
                    </span>
                    {hasDot && (
                      <div className="mt-0.5 flex gap-0.5">
                        {dayBookings.slice(0, 3).map((b) => (
                          <span
                            key={b.id}
                            className={`h-1 w-1 rounded-full ${isSelected ? "bg-white/70" : STATUS_DOT[b.status] ?? "bg-slate-300"}`}
                          />
                        ))}
                      </div>
                    )}
                  </>
                )}
              </div>
            );
          })}
        </div>
      </div>

      {/* Selected day bookings */}
      {selectedDay && (
        <div className="scroll-list shrink-0 max-h-40 overflow-y-auto border-t border-slate-100">
          <div className="px-4 py-2">
            <p className="mb-1.5 text-[11px] font-semibold uppercase tracking-wider text-slate-400">
              {MONTH_NAMES[month]} {selectedDay}
            </p>
            {selectedDayBookings.length === 0 ? (
              <p className="text-xs text-slate-400">No bookings on this day</p>
            ) : (
              <div className="space-y-1.5">
                {selectedDayBookings.map((b) => (
                  <div key={b.id} className="flex items-center justify-between gap-2 rounded-lg bg-slate-50 px-3 py-2">
                    <div className="min-w-0">
                      <p className="truncate text-xs font-semibold text-slate-900">{b.resourceName}</p>
                      <p className="text-[11px] text-slate-500">
                        {new Date(b.startTime).toLocaleTimeString("en-LK", { timeStyle: "short" })}
                        {" → "}
                        {new Date(b.endTime).toLocaleTimeString("en-LK", { timeStyle: "short" })}
                      </p>
                    </div>
                    <span className={`shrink-0 rounded-full px-2 py-0.5 text-[10px] font-semibold ${STATUS_PILL[b.status] ?? STATUS_PILL.CANCELLED}`}>
                      {b.status}
                    </span>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
