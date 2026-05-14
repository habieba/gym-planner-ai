"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { getOnboardingData } from "@/lib/onboardingStorage";
import {
  ACTIVE_WORKOUT_KEY,
  buildWeekSchedule,
  formatISODate,
  getCompletionRecords,
  getWeeklyPlanTemplate,
  getWorkoutRecord,
  isTodayOrPast,
  removeWorkoutRecord,
  saveWorkoutRecord,
} from "@/lib/scheduleStorage";
import { ChevronLeft, ChevronRight } from "lucide-react";

function getStartOfWeek(date = new Date()) {
  const copy = new Date(date);
  const day = copy.getDay(); // Sunday = 0
  const diff = day === 0 ? -6 : 1 - day; // Monday start
  copy.setDate(copy.getDate() + diff);
  copy.setHours(0, 0, 0, 0);
  return copy;
}

function addDays(date, days) {
  const copy = new Date(date);
  copy.setDate(copy.getDate() + days);
  return copy;
}

function getWeekDates(weekStartDate) {
  return Array.from({ length: 7 }, (_, index) => {
    const current = addDays(weekStartDate, index);

    return {
      date: formatISODate(current),
      shortDay: new Intl.DateTimeFormat("en-US", {
        weekday: "short",
      }).format(current),
      fullDay: new Intl.DateTimeFormat("en-US", {
        weekday: "long",
      }).format(current),
      dateLabel: new Intl.DateTimeFormat("en-US", {
        month: "short",
        day: "numeric",
      }).format(current),
    };
  });
}

function formatWeekRange(weekDates) {
    if (!weekDates.length) return "";
  
    const [startYear, startMonth, startDay] = weekDates[0].date
      .split("-")
      .map(Number);
  
    const [endYear, endMonth, endDay] = weekDates[6].date
      .split("-")
      .map(Number);
  
    const start = new Date(startYear, startMonth - 1, startDay);
    const end = new Date(endYear, endMonth - 1, endDay);
  
    const startLabel = new Intl.DateTimeFormat("en-US", {
      month: "short",
      day: "numeric",
    }).format(start);
  
    const endLabel = new Intl.DateTimeFormat("en-US", {
      month: "short",
      day: "numeric",
    }).format(end);
  
    return `${startLabel} - ${endLabel}`;
  }

function formatTime(time) {
  if (!time) return "";

  const [hourString, minuteString] = time.split(":");
  const hour = Number(hourString);
  const minute = minuteString;

  const period = hour >= 12 ? "PM" : "AM";
  const displayHour = hour % 12 === 0 ? 12 : hour % 12;

  return `${displayHour}:${minute} ${period}`;
}

export default function SchedulePage() {
  const router = useRouter();

  const [weeklyTemplate, setWeeklyTemplate] = useState([]);
  const [completionRecords, setCompletionRecords] = useState({});
  const [editingWorkoutId, setEditingWorkoutId] = useState(null);
  const [currentWeekStart, setCurrentWeekStart] = useState(getStartOfWeek());
  const [futureWorkoutMessageKey, setFutureWorkoutMessageKey] = useState("");

  const weekDates = getWeekDates(currentWeekStart);
  const scheduledWorkouts = buildWeekSchedule(
    weeklyTemplate,
    weekDates,
    completionRecords
  );

  useEffect(() => {
    const profile = getOnboardingData();

    const timeoutId = window.setTimeout(() => {
      setWeeklyTemplate(getWeeklyPlanTemplate(profile));
      setCompletionRecords(getCompletionRecords());
    }, 0);

    return () => window.clearTimeout(timeoutId);
  }, []);

  function goToPreviousWeek() {
    setCurrentWeekStart((current) => addDays(current, -7));
  }

  function goToNextWeek() {
    setCurrentWeekStart((current) => addDays(current, 7));
  }

  function goToThisWeek() {
    setCurrentWeekStart(getStartOfWeek());
  }

  function markMissed(workout) {
    if (!isTodayOrPast(workout.date)) return;

    const nextRecords = saveWorkoutRecord(workout, {
      status: "missed",
      missedAt: new Date().toISOString(),
    });

    setCompletionRecords(nextRecords);
  }

  function undoWorkoutStatus(workout) {
    const nextRecords = removeWorkoutRecord(workout);

    setCompletionRecords(nextRecords);
  }

  function openWorkout(workout) {
    if (!isTodayOrPast(workout.date)) {
      setFutureWorkoutMessageKey(`${workout.date}-${workout.id}`);
      return;
    }

    setFutureWorkoutMessageKey("");

    const record = getWorkoutRecord(completionRecords, workout);
    const activeWorkout = {
      ...workout,
      status: record?.status || workout.status,
      completedAt: record?.completedAt || null,
      notes: record?.notes || "",
      openedAt: new Date().toISOString(),
    };

    localStorage.setItem(ACTIVE_WORKOUT_KEY, JSON.stringify(activeWorkout));
    router.push("/workout");
  }

  function getWorkoutForDate(date) {
    return scheduledWorkouts.find((workout) => workout.date === date);
  }

  return (
    <main className="min-h-screen bg-background px-6 py-10 text-foreground">
      <div className="mx-auto max-w-7xl">
        <div className="flex flex-col justify-between gap-4 sm:flex-row sm:items-center">
          <div>
            <p className="text-sm font-semibold text-primary">Weekly schedule</p>
            <h1 className="mt-2 text-4xl font-bold">Your workout calendar</h1>
            <p className="mt-3 max-w-2xl text-muted">
              View your week, open workouts, reschedule sessions, and track
              missed days.
            </p>
          </div>

          <div className="flex flex-wrap gap-3">
            <Link
              href="/plan"
              className="rounded-xl border border-border bg-card px-5 py-3 text-center font-semibold text-foreground shadow-sm"
            >
              Back to plan
            </Link>

            <Link
              href="/dashboard"
              className="rounded-xl bg-primary px-5 py-3 text-center font-semibold text-white shadow-sm transition hover:bg-primary-hover"
            >
              Dashboard
            </Link>
          </div>
        </div>

        <section className="mt-8 rounded-2xl border border-border bg-card p-4 shadow-sm">
          <div className="mb-4 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
            <div>
              <h2 className="text-xl font-semibold">Week view</h2>
              <p className="text-sm text-muted">{formatWeekRange(weekDates)}</p>
            </div>

            <div className="flex flex-wrap gap-2">
                <button
                    type="button"
                    onClick={goToPreviousWeek}
                    aria-label="Previous week"
                    className="flex h-10 w-10 items-center justify-center rounded-xl border border-border bg-background text-xl font-semibold text-foreground transition hover:border-primary"
                >
                    <ChevronLeft size={18} />
                </button>

                <button
                    type="button"
                    onClick={goToThisWeek}
                    className="rounded-xl border border-border bg-background px-4 py-2 text-sm font-semibold text-foreground transition hover:border-primary"
                >
                    This week
                </button>

                <button
                    type="button"
                    onClick={goToNextWeek}
                    aria-label="Next week"
                    className="flex h-10 w-10 items-center justify-center rounded-xl border border-border bg-background text-xl font-semibold text-foreground transition hover:border-primary"
                >
                    <ChevronRight size={18} />
                </button>
                </div>
          </div>

          <div className="overflow-x-auto pb-2">
            <div className="grid min-w-[1120px] grid-cols-7 gap-4 xl:min-w-0">
              {weekDates.map((dayInfo) => {
                const workout = getWorkoutForDate(dayInfo.date);

                return (
                  <article
                    key={dayInfo.date}
                    className="min-h-[360px] rounded-2xl border border-border bg-background p-4"
                  >
                    <div className="flex items-start justify-between gap-3">
                      <div>
                        <p className="text-sm font-semibold text-primary">
                          {dayInfo.shortDay}
                        </p>
                        <h3 className="mt-1 text-xl font-bold">
                          {dayInfo.dateLabel}
                        </h3>
                        <p className="text-xs text-muted">{dayInfo.fullDay}</p>
                      </div>

                      {workout ? (
                        <StatusBadge status={workout.status} />
                      ) : (
                        <span className="rounded-full border border-border bg-card px-3 py-1 text-xs font-medium text-muted">
                          Rest
                        </span>
                      )}
                    </div>

                    {workout ? (
                      <div className="mt-5">
                        <p className="text-sm font-semibold text-primary">
                          {formatTime(workout.startTime)}
                        </p>

                        <h4 className="mt-1 text-xl font-bold">
                          {workout.title}
                        </h4>

                        <p className="mt-2 text-sm text-muted">
                          {workout.durationMinutes} min •{" "}
                          {workout.exercises.length} exercises
                        </p>

                        {editingWorkoutId === workout.id ? (
                          <div className="mt-4 rounded-xl border border-border bg-card p-3">
                            <p className="text-sm font-medium text-muted">
                              Weekly overrides are not enabled yet.
                            </p>
                            <button
                              type="button"
                              onClick={() => setEditingWorkoutId(null)}
                              className="mt-4 w-full rounded-lg bg-primary px-3 py-2 text-sm font-semibold text-white transition hover:bg-primary-hover"
                            >
                              Done
                            </button>
                          </div>
                        ) : (
                          <div className="mt-6 space-y-2">
                            <button
                              type="button"
                              onClick={() => openWorkout(workout)}
                              className="w-full rounded-xl bg-primary px-4 py-2 text-sm font-semibold text-white transition hover:bg-primary-hover"
                            >
                              View workout
                            </button>

                            {futureWorkoutMessageKey ===
                              `${workout.date}-${workout.id}` && (
                              <p className="rounded-xl border border-amber-200 bg-amber-100 px-3 py-2 text-xs font-medium text-amber-800">
                                This workout is scheduled for {workout.date}.
                                You can open it on the workout day.
                              </p>
                            )}

                            <button
                              type="button"
                              onClick={() => setEditingWorkoutId(workout.id)}
                              className="w-full rounded-xl border border-border bg-card px-4 py-2 text-sm font-semibold text-foreground transition hover:border-primary"
                            >
                              Reschedule
                            </button>

                            {workout.status === "completed" ? (
                              <button
                                type="button"
                                onClick={() => undoWorkoutStatus(workout)}
                                className="w-full rounded-xl border border-border bg-card px-4 py-2 text-sm font-semibold text-muted transition hover:border-primary"
                              >
                                Undo completed
                              </button>
                            ) : workout.status === "missed" ? (
                              <button
                                type="button"
                                onClick={() => undoWorkoutStatus(workout)}
                                className="w-full rounded-xl border border-border bg-card px-4 py-2 text-sm font-semibold text-muted transition hover:border-primary"
                              >
                                Undo missed
                              </button>
                            ) : (
                              <button
                                type="button"
                                onClick={() => markMissed(workout)}
                                className="w-full rounded-xl border border-border bg-card px-4 py-2 text-sm font-semibold text-muted transition hover:border-primary disabled:cursor-not-allowed disabled:opacity-60"
                                disabled={!isTodayOrPast(workout.date)}
                              >
                                {isTodayOrPast(workout.date)
                                  ? "Mark missed"
                                  : "Not available yet"}
                              </button>
                            )}
                          </div>
                        )}
                      </div>
                    ) : (
                      <div className="mt-5 rounded-xl border border-dashed border-border bg-card p-4">
                        <p className="text-sm font-medium text-muted">
                          No workout scheduled.
                        </p>
                        <p className="mt-2 text-xs text-muted">
                          Rest days matter for recovery and consistency.
                        </p>
                      </div>
                    )}
                  </article>
                );
              })}
            </div>
          </div>
        </section>
      </div>
    </main>
  );
}

function StatusBadge({ status }) {
  const styles = {
    scheduled: "border-border bg-card text-muted",
    completed: "border-green-200 bg-green-100 text-green-700",
    missed: "border-amber-200 bg-amber-100 text-amber-700",
  };

  return (
    <span
      className={`rounded-full border px-3 py-1 text-xs font-medium ${
        styles[status] || styles.scheduled
      }`}
    >
      {status.replace("_", " ")}
    </span>
  );
}
