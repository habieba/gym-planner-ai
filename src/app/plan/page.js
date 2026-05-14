"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { getOnboardingData } from "@/lib/onboardingStorage";
import { buildMockPlan } from "@/lib/mockPlan";
import { getExerciseById } from "@/lib/exerciseHelpers";
import {
  ACTIVE_WORKOUT_KEY,
  LEGACY_SCHEDULE_KEY,
  WEEKLY_TEMPLATE_KEY,
} from "@/lib/scheduleStorage";

export default function PlanPage() {
  const router = useRouter();
  const [profile, setProfile] = useState(null);
  const [plan, setPlan] = useState([]);

  function loadLatestPlan() {
    const savedProfile = getOnboardingData();
    setProfile(savedProfile);
    setPlan(buildMockPlan(savedProfile));
  }

  useEffect(() => {
    const timeoutId = window.setTimeout(loadLatestPlan, 0);

    window.addEventListener("focus", loadLatestPlan);

    return () => {
      window.clearTimeout(timeoutId);
      window.removeEventListener("focus", loadLatestPlan);
    };
  }, []);

  function handleContinueToSchedule() {
    localStorage.removeItem(LEGACY_SCHEDULE_KEY);
    localStorage.removeItem(ACTIVE_WORKOUT_KEY);
    localStorage.removeItem(WEEKLY_TEMPLATE_KEY);

    router.push("/schedule");
  }

  if (!profile) {
    return (
      <main className="min-h-screen bg-background px-6 py-10 text-foreground">
        <p>Loading plan...</p>
      </main>
    );
  }

  return (
    <main className="min-h-screen bg-background px-6 py-10 text-foreground">
      <div className="mx-auto max-w-5xl">
        <div className="flex flex-col justify-between gap-4 sm:flex-row sm:items-center">
          <div>
            <p className="text-sm font-semibold text-primary">Your first plan</p>
            <h1 className="mt-2 text-4xl font-bold">Generated workout plan</h1>
            <p className="mt-3 max-w-2xl text-muted">
              Review your weekly workout plan before scheduling exact dates and
              times.
            </p>
          </div>

          <Link
            href="/onboarding/goal"
            className="rounded-xl border border-border bg-card px-5 py-3 text-center font-semibold text-foreground shadow-sm transition hover:border-primary"
          >
            Edit quiz
          </Link>
        </div>

        <section className="mt-8 rounded-2xl border border-border bg-card p-6 shadow-sm">
          <h2 className="text-2xl font-semibold">Plan summary</h2>

          <div className="mt-5 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
            <SummaryItem label="Main goal" value={profile.primaryGoal || "Not set"} />
            <SummaryItem
              label="Experience"
              value={profile.experienceLevel || "Not set"}
            />
            <SummaryItem
              label="Days/week"
              value={profile.daysPerWeek ? `${profile.daysPerWeek} days` : "Not set"}
            />
            <SummaryItem
              label="Preferred time"
              value={profile.preferredTime || "Not set"}
            />
          </div>

          {profile.goalDescription && (
            <div className="mt-5 rounded-xl border border-border bg-background p-4">
              <p className="text-sm font-semibold text-muted">Your goal notes</p>
              <p className="mt-2">{profile.goalDescription}</p>
            </div>
          )}

          {profile.focusAreas?.length > 0 && (
            <div className="mt-5">
              <p className="text-sm font-semibold text-muted">Focus areas</p>
              <div className="mt-2 flex flex-wrap gap-2">
                {profile.focusAreas.map((area) => (
                  <span
                    key={area}
                    className="rounded-full border border-border bg-background px-3 py-1 text-sm text-muted"
                  >
                    {area}
                  </span>
                ))}
              </div>
            </div>
          )}
        </section>

        <section className="mt-8">
          <h2 className="text-2xl font-semibold">Weekly plan</h2>
          <p className="mt-1 text-muted">
            This plan will become your in-app schedule.
          </p>

          <div className="mt-5 grid gap-5">
            {plan.map((workout, index) => (
              <WorkoutCard key={`${workout.day}-${index}`} workout={workout} />
            ))}
          </div>
        </section>

        <section className="mt-8 rounded-2xl border border-border bg-card p-6 shadow-sm">
          <h2 className="text-2xl font-semibold">Why this plan fits</h2>

          <ul className="mt-4 space-y-3 text-muted">
            <li>• It uses your selected training days and weekly availability.</li>
            <li>• The split is adjusted based on your main goal and focus areas.</li>
            <li>• Workout length is based on your time preference.</li>
            <li>
              • Exercise details, instructions, and alternates come from your
              exercise library.
            </li>
          </ul>
        </section>

        <div className="mt-8 flex justify-end">
          <button
            type="button"
            onClick={handleContinueToSchedule}
            className="rounded-xl bg-primary px-6 py-3 font-semibold text-white transition hover:bg-primary-hover"
          >
            Continue to schedule
          </button>
        </div>
      </div>
    </main>
  );
}

function SummaryItem({ label, value }) {
  return (
    <div className="rounded-xl border border-border bg-background p-4">
      <p className="text-sm text-muted">{label}</p>
      <p className="mt-1 font-semibold">{value}</p>
    </div>
  );
}

function WorkoutCard({ workout }) {
  return (
    <article className="rounded-2xl border border-border bg-card p-6 shadow-sm">
      <div className="flex flex-col justify-between gap-2 sm:flex-row sm:items-start">
        <div>
          <p className="text-sm font-semibold text-primary">{workout.day}</p>
          <h3 className="mt-1 text-2xl font-bold">{workout.title}</h3>
        </div>

        <p className="rounded-full border border-border bg-background px-4 py-2 text-sm font-medium text-muted">
          {workout.duration}
        </p>
      </div>

      <div className="mt-5 overflow-hidden rounded-xl border border-border">
        <table className="w-full border-collapse text-left text-sm">
          <thead className="bg-background text-muted">
            <tr>
              <th className="px-4 py-3 font-semibold">Exercise</th>
              <th className="px-4 py-3 font-semibold">Sets</th>
              <th className="px-4 py-3 font-semibold">Reps</th>
              <th className="px-4 py-3 font-semibold">Target</th>
            </tr>
          </thead>

          <tbody>
            {workout.exercises.map((plannedExercise) => {
              const exercise = getExerciseById(plannedExercise.exerciseId);

              return (
                <tr
                  key={plannedExercise.exerciseId}
                  className="border-t border-border"
                >
                  <td className="px-4 py-3 font-medium">
                    {exercise ? exercise.name : plannedExercise.exerciseId}
                  </td>

                  <td className="px-4 py-3 text-muted">
                    {plannedExercise.sets}
                  </td>

                  <td className="px-4 py-3 text-muted">
                    {plannedExercise.reps}
                  </td>

                  <td className="px-4 py-3 text-muted">
                    {exercise
                      ? exercise.primaryMuscles.slice(0, 2).join(", ")
                      : "Missing"}
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </article>
  );
}
