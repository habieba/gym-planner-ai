"use client";

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import {
  Bar,
  BarChart,
  Cell,
  Pie,
  PieChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";
import { getOnboardingData } from "@/lib/onboardingStorage";
import {
  ACTIVE_WORKOUT_KEY,
  buildWeekSchedule,
  formatISODate,
  getCompletionRecords,
  getTodayISODate,
  getWeeklyPlanTemplate,
} from "@/lib/scheduleStorage";

const STATUS_COLORS = {
  completed: "#16a34a",
  missed: "#d97706",
  remaining: "#64748b",
};

function getStartOfWeek(date = new Date()) {
  const copy = new Date(date);
  const day = copy.getDay();
  const diff = day === 0 ? -6 : 1 - day;
  copy.setDate(copy.getDate() + diff);
  copy.setHours(0, 0, 0, 0);
  return copy;
}

function addDays(date, days) {
  const copy = new Date(date);
  copy.setDate(copy.getDate() + days);
  return copy;
}

function formatDateLabel(dateString) {
  if (!dateString) return "No date";

  const [year, month, day] = dateString.split("-").map(Number);
  const date = new Date(year, month - 1, day);

  return new Intl.DateTimeFormat("en-US", {
    weekday: "short",
    month: "short",
    day: "numeric",
  }).format(date);
}

function formatWeekRange(startDate, endDate) {
  const startLabel = new Intl.DateTimeFormat("en-US", {
    month: "short",
    day: "numeric",
  }).format(startDate);

  const endLabel = new Intl.DateTimeFormat("en-US", {
    month: "short",
    day: "numeric",
  }).format(endDate);

  return `${startLabel} - ${endLabel}`;
}

function formatTime(time) {
  if (!time) return "";

  const [hourString, minuteString] = time.split(":");
  const hour = Number(hourString);
  const period = hour >= 12 ? "PM" : "AM";
  const displayHour = hour % 12 === 0 ? 12 : hour % 12;

  return `${displayHour}:${minuteString} ${period}`;
}

function getWeekDates(weekStart) {
  return Array.from({ length: 7 }, (_, index) => {
    const current = addDays(weekStart, index);

    return {
      date: formatISODate(current),
      fullDay: new Intl.DateTimeFormat("en-US", {
        weekday: "long",
      }).format(current),
    };
  });
}

function getCoachInsight(completionRate, completedCount, missedCount, remainingCount) {
  if (completedCount === 0 && remainingCount > 0) {
    return "Your week is still open. Start with the next scheduled workout and keep the bar low enough to begin.";
  }

  if (completionRate === 100 && completedCount > 0) {
    return "Great week. You completed every scheduled workout. Keep the same rhythm next week or increase intensity slightly.";
  }

  if (missedCount > completedCount) {
    return "Your schedule may be too ambitious right now. Try fewer days, shorter sessions, or move workouts to easier days.";
  }

  if (completionRate >= 50) {
    return "You completed at least half of your plan. Protect the next workout slot and aim to finish the week strong.";
  }

  return "Focus on one workout next. Consistency usually improves faster when the next step feels very doable.";
}

function getCompletionStreak(recentWorkouts) {
  let streak = 0;

  for (const workout of recentWorkouts) {
    if (workout.status !== "completed") break;
    streak += 1;
  }

  return streak;
}

export default function DashboardPage() {
  const router = useRouter();
  const [weeklyTemplate, setWeeklyTemplate] = useState([]);
  const [completionRecords, setCompletionRecords] = useState({});
  const [isLoaded, setIsLoaded] = useState(false);

  useEffect(() => {
    const timeoutId = window.setTimeout(() => {
      const profile = getOnboardingData();

      setWeeklyTemplate(getWeeklyPlanTemplate(profile));
      setCompletionRecords(getCompletionRecords());
      setIsLoaded(true);
    }, 0);

    return () => window.clearTimeout(timeoutId);
  }, []);

  const todayISO = getTodayISODate();
  const weekStart = useMemo(() => getStartOfWeek(), []);
  const weekEnd = useMemo(() => addDays(weekStart, 6), [weekStart]);
  const weekDates = useMemo(() => getWeekDates(weekStart), [weekStart]);
  const thisWeekWorkouts = buildWeekSchedule(
    weeklyTemplate,
    weekDates,
    completionRecords
  );
  const completedWorkouts = thisWeekWorkouts.filter(
    (workout) => workout.status === "completed"
  );
  const missedWorkouts = thisWeekWorkouts.filter(
    (workout) => workout.status === "missed"
  );
  const remainingWorkouts = thisWeekWorkouts.filter(
    (workout) => workout.status === "scheduled"
  );
  const completionRate =
    thisWeekWorkouts.length > 0
      ? Math.round((completedWorkouts.length / thisWeekWorkouts.length) * 100)
      : 0;
  const todayScheduledWorkout = remainingWorkouts.find(
    (workout) => workout.date === todayISO
  );
  const nextWorkout =
    remainingWorkouts.find((workout) => workout.date >= todayISO) ||
    remainingWorkouts[0] ||
    null;
  const heroWorkout = todayScheduledWorkout || nextWorkout;

  const templateById = new Map(
    weeklyTemplate.map((workout) => [workout.id, workout])
  );
  const recentWorkouts = Object.entries(completionRecords)
    .flatMap(([date, dateRecords]) =>
      Object.entries(dateRecords).map(([workoutId, record]) => {
        const templateWorkout = templateById.get(workoutId);

        return {
          id: `${date}-${workoutId}`,
          title: templateWorkout?.title || record.title || workoutId,
          date,
          status: record.status,
          notes: record.notes || "",
          exerciseCompletionCount: record.exerciseCompletions
            ? record.exerciseCompletions.filter((item) => item.completed).length
            : null,
          exerciseCount:
            record.exerciseCompletions?.length ||
            templateWorkout?.exercises?.length ||
            null,
        };
      })
    )
    .sort((a, b) => (b.date || "").localeCompare(a.date || ""))
    .slice(0, 8);
  const recentNotes = recentWorkouts.filter((workout) => workout.notes).slice(0, 3);
  const completionStreak = getCompletionStreak(recentWorkouts);
  const breakdownData = [
    { name: "Completed", key: "completed", value: completedWorkouts.length },
    { name: "Missed", key: "missed", value: missedWorkouts.length },
    { name: "Remaining", key: "remaining", value: remainingWorkouts.length },
  ].filter((item) => item.value > 0);
  const barData = [
    {
      name: "This week",
      scheduled: thisWeekWorkouts.length,
      completed: completedWorkouts.length,
      missed: missedWorkouts.length,
    },
  ];
  const upcomingWorkouts = thisWeekWorkouts
    .filter((workout) => workout.status === "scheduled" && workout.date >= todayISO)
    .slice(0, 3);
  const coachInsight = getCoachInsight(
    completionRate,
    completedWorkouts.length,
    missedWorkouts.length,
    remainingWorkouts.length
  );

  function openWorkout(workout) {
    const activeWorkout = {
      ...workout,
      openedAt: new Date().toISOString(),
    };

    localStorage.setItem(ACTIVE_WORKOUT_KEY, JSON.stringify(activeWorkout));
    router.push("/workout");
  }

  return (
    <main className="min-h-screen bg-background px-6 py-10 text-foreground">
      <div className="mx-auto max-w-7xl">
        <div className="flex flex-col justify-between gap-4 sm:flex-row sm:items-center">
          <div>
            <p className="text-sm font-semibold text-primary">Your progress</p>
            <h1 className="mt-2 text-4xl font-bold">Workout accountability</h1>
            <p className="mt-3 max-w-2xl text-muted">
              Know what to do next, how the week is going, and what to adjust.
            </p>
          </div>

          <div className="flex flex-wrap gap-3">
            <Link
              href="/schedule"
              className="rounded-xl border border-border bg-card px-5 py-3 text-center font-semibold text-foreground shadow-sm transition hover:border-primary"
            >
              View schedule
            </Link>

            <Link
              href="/plan"
              className="rounded-xl border border-border bg-card px-5 py-3 text-center font-semibold text-foreground shadow-sm transition hover:border-primary"
            >
              View plan
            </Link>

            <Link
              href="/onboarding/goal"
              className="rounded-xl bg-primary px-5 py-3 text-center font-semibold text-white shadow-sm transition hover:bg-primary-hover"
            >
              Edit quiz
            </Link>
          </div>
        </div>

        <section className="mt-8 rounded-2xl border border-border bg-card p-6 shadow-sm">
          <div className="flex flex-col gap-5 lg:flex-row lg:items-center lg:justify-between">
            <div>
              <p className="text-sm font-semibold text-primary">
                {todayScheduledWorkout ? "Today’s workout" : "Next workout"}
              </p>
              {heroWorkout ? (
                <>
                  <h2 className="mt-2 text-3xl font-bold">{heroWorkout.title}</h2>
                  <p className="mt-2 text-muted">
                    {formatDateLabel(heroWorkout.date)} •{" "}
                    {formatTime(heroWorkout.startTime)} •{" "}
                    {heroWorkout.exercises.length} exercises
                  </p>
                </>
              ) : (
                <>
                  <h2 className="mt-2 text-3xl font-bold">No workout today</h2>
                  <p className="mt-2 text-muted">
                    Build a plan or schedule your first recurring week.
                  </p>
                </>
              )}
            </div>

            <div className="flex flex-wrap gap-3">
              {heroWorkout && (
                <button
                  type="button"
                  onClick={() => openWorkout(heroWorkout)}
                  className="rounded-xl bg-primary px-5 py-3 text-center font-semibold text-white transition hover:bg-primary-hover"
                >
                  Open next workout
                </button>
              )}

              <Link
                href="/schedule"
                className="rounded-xl border border-border bg-background px-5 py-3 text-center font-semibold text-foreground transition hover:border-primary"
              >
                View schedule
              </Link>

              <Link
                href="/plan"
                className="rounded-xl border border-border bg-background px-5 py-3 text-center font-semibold text-foreground transition hover:border-primary"
              >
                View plan
              </Link>
            </div>
          </div>
        </section>

        <section className="mt-8 grid gap-4 lg:grid-cols-3">
          <ProgressCard
            completed={completedWorkouts.length}
            total={thisWeekWorkouts.length}
            rate={completionRate}
            weekLabel={formatWeekRange(weekStart, weekEnd)}
            isLoaded={isLoaded}
          />
          <MetricCard
            label="Consistency streak"
            value={`${completionStreak}`}
            helper={
              completionStreak === 1
                ? "You completed your last scheduled workout."
                : `You completed your last ${completionStreak} scheduled workouts.`
            }
          />
          <MetricCard
            label="Completion rate"
            value={`${completionRate}%`}
            helper={`${missedWorkouts.length} missed • ${remainingWorkouts.length} remaining`}
          />
        </section>

        <section className="mt-8 grid gap-5 lg:grid-cols-2">
          <ChartCard title="This week breakdown">
            {breakdownData.length > 0 ? (
              <>
                <ChartLegend items={breakdownData} />
                <ResponsiveContainer width="100%" height={240}>
                  <PieChart>
                    <Pie
                      data={breakdownData}
                      dataKey="value"
                      nameKey="name"
                      innerRadius={58}
                      outerRadius={92}
                      paddingAngle={3}
                    >
                      {breakdownData.map((entry) => (
                        <Cell
                          key={entry.key}
                          fill={STATUS_COLORS[entry.key]}
                        />
                      ))}
                    </Pie>
                    <Tooltip />
                  </PieChart>
                </ResponsiveContainer>
              </>
            ) : (
              <EmptyState text="No workouts planned this week." />
            )}
          </ChartCard>

          <ChartCard title="Workout status chart">
            <ChartLegend
              items={[
                { name: "Scheduled", key: "remaining" },
                { name: "Completed", key: "completed" },
                { name: "Missed", key: "missed" },
              ]}
            />
            <ResponsiveContainer width="100%" height={240}>
              <BarChart data={barData}>
                <XAxis dataKey="name" />
                <YAxis allowDecimals={false} />
                <Tooltip />
                <Bar dataKey="scheduled" fill="#64748b" radius={[6, 6, 0, 0]} />
                <Bar dataKey="completed" fill="#16a34a" radius={[6, 6, 0, 0]} />
                <Bar dataKey="missed" fill="#d97706" radius={[6, 6, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </ChartCard>
        </section>

        <section className="mt-8 grid gap-5 lg:grid-cols-3">
          <ListCard title="Upcoming workouts">
            {upcomingWorkouts.length > 0 ? (
              upcomingWorkouts.map((workout) => (
                <CompactWorkoutItem
                  key={`${workout.date}-${workout.id}`}
                  title={workout.title}
                  date={workout.date}
                  detail={`${formatTime(workout.startTime)} • ${workout.exercises.length} exercises`}
                />
              ))
            ) : (
              <EmptyState text="No remaining workouts this week." />
            )}
          </ListCard>

          <ListCard title="Recent activity">
            {recentWorkouts.length > 0 ? (
              recentWorkouts.slice(0, 5).map((workout) => (
                <CompactWorkoutItem
                  key={workout.id}
                  title={workout.title}
                  date={workout.date}
                  status={workout.status}
                  detail={
                    workout.exerciseCompletionCount !== null &&
                    workout.exerciseCount !== null
                      ? `${workout.exerciseCompletionCount} of ${workout.exerciseCount} exercises completed`
                      : ""
                  }
                />
              ))
            ) : (
              <EmptyState text="Complete or miss a workout to start your history." />
            )}
          </ListCard>

          <ListCard title="Coach insight">
            <div className="rounded-xl border border-border bg-background p-4">
              <p className="font-semibold">Recommendation</p>
              <p className="mt-2 text-sm text-muted">{coachInsight}</p>
            </div>
            {recentNotes.length > 0 && (
              <div className="mt-4">
                <p className="font-semibold">Recent notes</p>
                <div className="mt-3 space-y-3">
                  {recentNotes.map((workout) => (
                    <p
                      key={`${workout.id}-note`}
                      className="rounded-xl border border-border bg-background p-3 text-sm text-muted"
                    >
                      {workout.notes}
                    </p>
                  ))}
                </div>
              </div>
            )}
          </ListCard>
        </section>
      </div>
    </main>
  );
}

function ProgressCard({ completed, total, rate, weekLabel, isLoaded }) {
  return (
    <div className="rounded-xl border border-border bg-card p-5 shadow-sm">
      <p className="text-sm font-semibold text-primary">Weekly progress</p>
      <p className="mt-2 text-3xl font-bold">
        {isLoaded ? `${completed} of ${total}` : "Loading"}
      </p>
      <p className="mt-1 text-sm text-muted">{weekLabel}</p>
      <div className="mt-4 h-3 overflow-hidden rounded-full bg-background">
        <div
          className="h-full rounded-full bg-primary transition-all"
          style={{ width: `${rate}%` }}
        />
      </div>
      <p className="mt-2 text-sm font-semibold text-muted">{rate}% complete</p>
    </div>
  );
}

function MetricCard({ label, value, helper }) {
  return (
    <div className="rounded-xl border border-border bg-card p-5 shadow-sm">
      <p className="text-sm text-muted">{label}</p>
      <p className="mt-2 text-3xl font-bold">{value}</p>
      <p className="mt-2 text-sm text-muted">{helper}</p>
    </div>
  );
}

function ChartCard({ title, children }) {
  return (
    <div className="rounded-2xl border border-border bg-card p-6 shadow-sm">
      <h2 className="text-xl font-semibold">{title}</h2>
      <div className="mt-4">{children}</div>
    </div>
  );
}

function ChartLegend({ items }) {
  return (
    <div className="flex flex-wrap gap-3 text-sm text-muted">
      {items.map((item) => (
        <div key={item.key} className="flex items-center gap-2">
          <span
            className="h-3 w-3 rounded-full"
            style={{ backgroundColor: STATUS_COLORS[item.key] }}
          />
          <span>{item.name}</span>
        </div>
      ))}
    </div>
  );
}

function ListCard({ title, children }) {
  return (
    <div className="rounded-2xl border border-border bg-card p-6 shadow-sm">
      <h2 className="text-xl font-semibold">{title}</h2>
      <div className="mt-4 space-y-3">{children}</div>
    </div>
  );
}

function CompactWorkoutItem({ title, date, detail, status }) {
  return (
    <div className="rounded-xl border border-border bg-background p-4">
      <div className="flex items-start justify-between gap-3">
        <div>
          <p className="font-semibold">{title}</p>
          <p className="mt-1 text-sm text-muted">
            {formatDateLabel(date)}
            {detail ? ` • ${detail}` : ""}
          </p>
        </div>
        {status && <StatusBadge status={status} />}
      </div>
    </div>
  );
}

function EmptyState({ text }) {
  return (
    <div className="rounded-xl border border-dashed border-border bg-background p-4 text-sm text-muted">
      {text}
    </div>
  );
}

function StatusBadge({ status }) {
  const styles = {
    completed: "border-green-200 bg-green-100 text-green-700",
    missed: "border-amber-200 bg-amber-100 text-amber-700",
  };

  return (
    <span
      className={`inline-flex rounded-full border px-3 py-1 text-xs font-medium ${
        styles[status] || "border-border bg-background text-muted"
      }`}
    >
      {status}
    </span>
  );
}
