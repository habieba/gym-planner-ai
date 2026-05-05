"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { getOnboardingData } from "@/lib/onboardingStorage";

function chooseWorkoutLength(preference) {
  if (!preference) return "45 minutes";

  if (preference.includes("30")) return "30 minutes";
  if (preference.includes("45")) return "45 minutes";
  if (preference.includes("60")) return "60 minutes";
  if (preference.includes("75")) return "75 minutes";

  return "45-60 minutes";
}

function buildMockPlan(profile) {
  const daysPerWeek = Number(profile.daysPerWeek || 3);
  const availableDays = profile.availableDays || [];
  const selectedDays = availableDays.slice(0, daysPerWeek);
  const workoutLength = chooseWorkoutLength(profile.workoutLengthPreference);

  const fallbackDays = ["Monday", "Wednesday", "Friday"];
  const finalDays = selectedDays.length > 0 ? selectedDays : fallbackDays;

  const goal = profile.primaryGoal || "General fitness";
  const focusAreas = profile.focusAreas || [];

  let split = ["Full Body", "Full Body", "Full Body"];

  if (daysPerWeek >= 4) {
    split = ["Upper Body", "Lower Body", "Push", "Pull"];
  }

  if (focusAreas.includes("Glutes") && daysPerWeek >= 3) {
    split = ["Glutes + Legs", "Upper Body", "Glutes + Core", "Full Body"];
  }

  if (goal === "Build strength") {
    split = ["Strength Upper", "Strength Lower", "Accessory + Core", "Full Body"];
  }

  const exerciseBank = {
    "Full Body": [
      ["Goblet Squat", "3", "8-10"],
      ["Dumbbell Bench Press", "3", "8-10"],
      ["Lat Pulldown", "3", "10-12"],
      ["Romanian Deadlift", "3", "8-10"],
      ["Plank", "3", "30-45 sec"],
    ],
    "Upper Body": [
      ["Bench Press", "3", "6-8"],
      ["Lat Pulldown", "3", "8-10"],
      ["Seated Row", "3", "10-12"],
      ["Shoulder Press", "3", "8-10"],
      ["Bicep Curl", "2", "10-12"],
    ],
    "Lower Body": [
      ["Squat", "3", "6-8"],
      ["Romanian Deadlift", "3", "8-10"],
      ["Leg Press", "3", "10-12"],
      ["Hamstring Curl", "3", "10-12"],
      ["Calf Raise", "2", "12-15"],
    ],
    Push: [
      ["Dumbbell Bench Press", "3", "8-10"],
      ["Shoulder Press", "3", "8-10"],
      ["Incline Press", "3", "10-12"],
      ["Lateral Raise", "2", "12-15"],
      ["Tricep Pushdown", "2", "10-12"],
    ],
    Pull: [
      ["Lat Pulldown", "3", "8-10"],
      ["Seated Row", "3", "10-12"],
      ["Face Pull", "2", "12-15"],
      ["Rear Delt Fly", "2", "12-15"],
      ["Bicep Curl", "2", "10-12"],
    ],
    "Glutes + Legs": [
      ["Hip Thrust", "4", "8-10"],
      ["Leg Press", "3", "10-12"],
      ["Romanian Deadlift", "3", "8-10"],
      ["Walking Lunge", "2", "10 each leg"],
      ["Cable Kickback", "2", "12-15"],
    ],
    "Glutes + Core": [
      ["Hip Thrust", "3", "8-10"],
      ["Bulgarian Split Squat", "3", "8 each leg"],
      ["Cable Kickback", "3", "12-15"],
      ["Ab Crunch Machine", "3", "10-12"],
      ["Side Plank", "2", "30 sec each side"],
    ],
    "Strength Upper": [
      ["Bench Press", "4", "4-6"],
      ["Barbell Row", "4", "5-6"],
      ["Overhead Press", "3", "5-6"],
      ["Lat Pulldown", "3", "8-10"],
      ["Farmer Carry", "3", "30 sec"],
    ],
    "Strength Lower": [
      ["Squat", "4", "4-6"],
      ["Romanian Deadlift", "3", "6-8"],
      ["Leg Press", "3", "8-10"],
      ["Hamstring Curl", "3", "8-10"],
      ["Calf Raise", "3", "10-12"],
    ],
    "Accessory + Core": [
      ["Incline Dumbbell Press", "3", "8-10"],
      ["Seated Row", "3", "8-10"],
      ["Lateral Raise", "3", "12-15"],
      ["Cable Crunch", "3", "10-12"],
      ["Plank", "3", "45 sec"],
    ],
  };

  return finalDays.map((day, index) => {
    const workoutType = split[index % split.length];

    return {
      day,
      title: workoutType,
      duration: workoutLength,
      exercises: exerciseBank[workoutType] || exerciseBank["Full Body"],
    };
  });
}

export default function PlanPage() {
  const [profile, setProfile] = useState(null);
  const [plan, setPlan] = useState([]);

  useEffect(() => {
    const savedProfile = getOnboardingData();
    setProfile(savedProfile);
    setPlan(buildMockPlan(savedProfile));
  }, []);

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
              This is a mock plan built from your quiz answers. Next, we will
              replace this logic with AI-generated plans.
            </p>
          </div>

          <Link
            href="/onboarding/goal"
            className="rounded-xl border border-border bg-card px-5 py-3 text-center font-semibold text-foreground shadow-sm"
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
        </section>

        <section className="mt-8">
          <div className="flex items-end justify-between gap-4">
            <div>
              <h2 className="text-2xl font-semibold">Weekly schedule</h2>
              <p className="mt-1 text-muted">
                Review the plan, then continue to scheduling exact dates and times.
              </p>
            </div>
          </div>

          <div className="mt-5 grid gap-5">
            {plan.map((workout, index) => (
              <WorkoutCard key={`${workout.day}-${index}`} workout={workout} />
            ))}
          </div>
        </section>

        <section className="mt-8 rounded-2xl border border-border bg-card p-6 shadow-sm">
          <h2 className="text-2xl font-semibold">Why this plan fits</h2>

          <ul className="mt-4 space-y-3 text-muted">
            <li>
              • It uses your selected weekly availability instead of randomly
              assigning workout days.
            </li>
            <li>
              • The split is adjusted based on your main goal and focus areas.
            </li>
            <li>
              • Workout length is based on your time preference, or chosen
              automatically if you were unsure.
            </li>
            <li>
              • Later, the AI version will also account for injuries, disliked
              exercises, and progress logs.
            </li>
          </ul>
        </section>

        <div className="mt-8 flex justify-end">
          <Link
            href="/schedule"
            className="rounded-xl bg-primary px-6 py-3 font-semibold text-white transition hover:bg-primary-hover"
          >
            Continue to schedule
          </Link>
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
            </tr>
          </thead>
          <tbody>
            {workout.exercises.map(([name, sets, reps]) => (
              <tr key={name} className="border-t border-border">
                <td className="px-4 py-3 font-medium">{name}</td>
                <td className="px-4 py-3 text-muted">{sets}</td>
                <td className="px-4 py-3 text-muted">{reps}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </article>
  );
}