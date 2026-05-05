"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { getOnboardingData } from "@/lib/onboardingStorage";
import { buildMockPlan } from "@/lib/mockPlan";
import { ChevronLeft, ChevronRight } from "lucide-react";

const SCHEDULE_STORAGE_KEY = "gym_scheduled_workouts";
const ACTIVE_WORKOUT_KEY = "gym_active_workout";

function formatISODate(date) {
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, "0");
    const day = String(date.getDate()).padStart(2, "0");
  
    return `${year}-${month}-${day}`;
  }

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

function getNextDateForDay(dayName) {
  const dayIndexMap = {
    Sunday: 0,
    Monday: 1,
    Tuesday: 2,
    Wednesday: 3,
    Thursday: 4,
    Friday: 5,
    Saturday: 6,
  };

  const today = new Date();
  const targetDayIndex = dayIndexMap[dayName];
  const todayIndex = today.getDay();

  let daysUntilTarget = targetDayIndex - todayIndex;

  if (daysUntilTarget < 0) {
    daysUntilTarget += 7;
  }

  const result = new Date(today);
  result.setDate(today.getDate() + daysUntilTarget);

  return formatISODate(result);
}

function getDurationInMinutes(duration) {
  if (!duration) return 45;
  if (duration.includes("30")) return 30;
  if (duration.includes("45")) return 45;
  if (duration.includes("60")) return 60;
  if (duration.includes("75")) return 75;
  return 60;
}

function addMinutesToTime(time, minutesToAdd) {
  const [hours, minutes] = time.split(":").map(Number);

  const date = new Date();
  date.setHours(hours);
  date.setMinutes(minutes + minutesToAdd);

  const endHours = String(date.getHours()).padStart(2, "0");
  const endMinutes = String(date.getMinutes()).padStart(2, "0");

  return `${endHours}:${endMinutes}`;
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

function createInitialSchedule(profile) {
  const mockPlan = buildMockPlan(profile);

  return mockPlan.map((workout) => {
    const startTime = profile.preferredTime || "18:00";
    const durationMinutes = getDurationInMinutes(workout.duration);

    return {
        ...workout,
        date: getNextDateForDay(workout.day),
        startTime,
        endTime: addMinutesToTime(startTime, durationMinutes),
        durationMinutes,
        status: "scheduled",
        profileVersion: profile.version || 0,
      };
  });
}

export default function SchedulePage() {
  const router = useRouter();

  const [scheduledWorkouts, setScheduledWorkouts] = useState([]);
  const [editingWorkoutId, setEditingWorkoutId] = useState(null);
  const [currentWeekStart, setCurrentWeekStart] = useState(getStartOfWeek());

  const weekDates = getWeekDates(currentWeekStart);

  useEffect(() => {
    const profile = getOnboardingData();
    const savedSchedule = localStorage.getItem(SCHEDULE_STORAGE_KEY);
  
    if (savedSchedule) {
      const parsedSchedule = JSON.parse(savedSchedule);
      const scheduleProfileVersion = parsedSchedule[0]?.profileVersion || 0;
      const currentProfileVersion = profile.version || 0;
  
      if (scheduleProfileVersion === currentProfileVersion) {
        setScheduledWorkouts(parsedSchedule);
        return;
      }
    }
  
    const newSchedule = createInitialSchedule(profile);
  
    setScheduledWorkouts(newSchedule);
    localStorage.setItem(SCHEDULE_STORAGE_KEY, JSON.stringify(newSchedule));
  }, []);

  function saveSchedule(nextSchedule) {
    setScheduledWorkouts(nextSchedule);
    localStorage.setItem(SCHEDULE_STORAGE_KEY, JSON.stringify(nextSchedule));
  }

  function goToPreviousWeek() {
    setCurrentWeekStart((current) => addDays(current, -7));
  }

  function goToNextWeek() {
    setCurrentWeekStart((current) => addDays(current, 7));
  }

  function goToThisWeek() {
    setCurrentWeekStart(getStartOfWeek());
  }

  function updateWorkout(workoutId, field, value) {
    const nextSchedule = scheduledWorkouts.map((workout) => {
      if (workout.id !== workoutId) return workout;

      const updatedWorkout = {
        ...workout,
        [field]: value,
      };

      if (field === "startTime" || field === "durationMinutes") {
        const newStartTime =
          field === "startTime" ? value : updatedWorkout.startTime;

        const newDuration =
          field === "durationMinutes"
            ? Number(value)
            : updatedWorkout.durationMinutes;

        updatedWorkout.endTime = addMinutesToTime(newStartTime, newDuration);
        updatedWorkout.durationMinutes = newDuration;
      }

      return updatedWorkout;
    });

    saveSchedule(nextSchedule);
  }

  function markMissed(workoutId) {
    const nextSchedule = scheduledWorkouts.map((workout) =>
      workout.id === workoutId ? { ...workout, status: "missed" } : workout
    );

    saveSchedule(nextSchedule);
  }

  function undoMissed(workoutId) {
    const nextSchedule = scheduledWorkouts.map((workout) =>
      workout.id === workoutId ? { ...workout, status: "scheduled" } : workout
    );

    saveSchedule(nextSchedule);
  }

  function openWorkout(workout) {
    const activeWorkout = {
      ...workout,
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
                          <EditWorkoutForm
                            workout={workout}
                            onChange={updateWorkout}
                            onDone={() => setEditingWorkoutId(null)}
                          />
                        ) : (
                          <div className="mt-6 space-y-2">
                            <button
                              type="button"
                              onClick={() => openWorkout(workout)}
                              className="w-full rounded-xl bg-primary px-4 py-2 text-sm font-semibold text-white transition hover:bg-primary-hover"
                            >
                              Workout
                            </button>

                            <button
                              type="button"
                              onClick={() => setEditingWorkoutId(workout.id)}
                              className="w-full rounded-xl border border-border bg-card px-4 py-2 text-sm font-semibold text-foreground transition hover:border-primary"
                            >
                              Reschedule
                            </button>

                            {workout.status === "missed" ? (
                              <button
                                type="button"
                                onClick={() => undoMissed(workout.id)}
                                className="w-full rounded-xl border border-border bg-card px-4 py-2 text-sm font-semibold text-muted transition hover:border-primary"
                              >
                                Undo missed
                              </button>
                            ) : (
                              <button
                                type="button"
                                onClick={() => markMissed(workout.id)}
                                className="w-full rounded-xl border border-border bg-card px-4 py-2 text-sm font-semibold text-muted transition hover:border-primary"
                              >
                                Mark missed
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

function EditWorkoutForm({ workout, onChange, onDone }) {
  return (
    <div className="mt-4 rounded-xl border border-border bg-card p-3">
      <label className="block">
        <span className="text-xs font-medium text-muted">Date</span>
        <input
          type="date"
          value={workout.date}
          onChange={(e) => onChange(workout.id, "date", e.target.value)}
          className="mt-1 w-full rounded-lg border border-border bg-background px-3 py-2 text-sm outline-none focus:border-primary"
        />
      </label>

      <label className="mt-3 block">
        <span className="text-xs font-medium text-muted">Start time</span>
        <input
          type="time"
          value={workout.startTime}
          onChange={(e) => onChange(workout.id, "startTime", e.target.value)}
          className="mt-1 w-full rounded-lg border border-border bg-background px-3 py-2 text-sm outline-none focus:border-primary"
        />
      </label>

      <label className="mt-3 block">
        <span className="text-xs font-medium text-muted">Duration</span>
        <select
          value={workout.durationMinutes}
          onChange={(e) =>
            onChange(workout.id, "durationMinutes", e.target.value)
          }
          className="mt-1 w-full rounded-lg border border-border bg-background px-3 py-2 text-sm outline-none focus:border-primary"
        >
          <option value={30}>30 minutes</option>
          <option value={45}>45 minutes</option>
          <option value={60}>60 minutes</option>
          <option value={75}>75 minutes</option>
          <option value={90}>90 minutes</option>
        </select>
      </label>

      <button
        type="button"
        onClick={onDone}
        className="mt-4 w-full rounded-lg bg-primary px-3 py-2 text-sm font-semibold text-white transition hover:bg-primary-hover"
      >
        Done
      </button>
    </div>
  );
}