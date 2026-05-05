"use client";
import InfoTip from "@/components/InfoTip";


import { useState } from "react";
import { useRouter } from "next/navigation";
import { saveOnboardingData } from "@/lib/onboardingStorage";

const days = ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday", "Sunday"];

const workoutLengthOptions = [
  "Quick: 30 minutes",
  "Standard: 45 minutes",
  "Full session: 60 minutes",
  "Long session: 75+ minutes",
  "Not sure, choose for me",
];

export default function SchedulePage() {
  const router = useRouter();

  const [daysPerWeek, setDaysPerWeek] = useState(3);
  const [availableDays, setAvailableDays] = useState([]);
  const [preferredTime, setPreferredTime] = useState("18:00");
  const [workoutLengthPreference, setWorkoutLengthPreference] = useState("");

  function toggleDay(day) {
    setAvailableDays((current) =>
      current.includes(day)
        ? current.filter((item) => item !== day)
        : [...current, day]
    );
  }

  function handleNext() {
    if (availableDays.length === 0 || !workoutLengthPreference) {
      alert("Choose your available days and workout length preference.");
      return;
    }

    saveOnboardingData({
      daysPerWeek,
      availableDays,
      preferredTime,
      workoutLengthPreference,
    });

    router.push("/onboarding/equipment");
  }

  return (
    <main className="min-h-screen bg-background px-6 py-10 text-foreground">
      <div className="mx-auto max-w-3xl">
        <p className="text-sm font-semibold text-primary">Step 4 of 6</p>
        <h1 className="mt-2 text-4xl font-bold">When can you train?</h1>
        <p className="mt-3 text-muted">
          This will later help us schedule workouts and add them to your calendar.
        </p>

        <section className="mt-8 rounded-2xl border border-border bg-card p-6 shadow-sm">
          <label className="block">
          <span className="flex items-center text-sm font-medium text-muted">
            Days per week
            <InfoTip text="Choose how many days you realistically want to train each week. It is better to start with a number you can actually maintain." />
            </span>
            <input
              type="number"
              min="1"
              max="7"
              value={daysPerWeek}
              onChange={(e) => setDaysPerWeek(Number(e.target.value))}
              className="mt-2 w-full rounded-xl border border-border bg-background px-4 py-3 outline-none focus:border-primary"
            />
          </label>

          <div className="mt-6">
          <p className="flex items-center text-sm font-medium text-muted">
            Available days
            <InfoTip text="Choose the days that usually work for you. The app will use these when building your weekly schedule." />
            </p>
            <div className="mt-3 grid gap-3 sm:grid-cols-2">
              {days.map((day) => (
                <button
                  key={day}
                  type="button"
                  onClick={() => toggleDay(day)}
                  className={`rounded-xl border px-4 py-3 text-left transition ${
                    availableDays.includes(day)
                      ? "border-primary bg-primary text-white"
                      : "border-border bg-background text-foreground hover:border-primary"
                  }`}
                >
                  {day}
                </button>
              ))}
            </div>
          </div>

          <label className="mt-6 block">
          <span className="flex items-center text-sm font-medium text-muted">
            Preferred workout time
            <InfoTip text="This is the default time used when workouts are scheduled. You can change exact times later before adding them to your calendar." />
            </span>            
            <input
              type="time"
              value={preferredTime}
              onChange={(e) => setPreferredTime(e.target.value)}
              className="mt-2 w-full rounded-xl border border-border bg-background px-4 py-3 outline-none focus:border-primary"
            />
          </label>
        </section>

        <section className="mt-6 rounded-2xl border border-border bg-card p-6 shadow-sm">
          <h2 className="text-xl font-semibold">How much time do you usually have?</h2>

          <div className="mt-4 grid gap-3 sm:grid-cols-2">
            {workoutLengthOptions.map((option) => (
              <button
                key={option}
                type="button"
                onClick={() => setWorkoutLengthPreference(option)}
                className={`rounded-xl border px-4 py-3 text-left transition ${
                  workoutLengthPreference === option
                    ? "border-primary bg-primary text-white"
                    : "border-border bg-background text-foreground hover:border-primary"
                }`}
              >
                {option}
              </button>
            ))}
          </div>
        </section>

        <div className="mt-8 flex justify-between">
          <button
            onClick={() => router.push("/onboarding/experience")}
            className="rounded-xl border border-border bg-card px-6 py-3 font-semibold text-foreground"
          >
            Back
          </button>

          <button
            onClick={handleNext}
            className="rounded-xl bg-primary px-6 py-3 font-semibold text-white transition hover:bg-primary-hover"
          >
            Next
          </button>
        </div>
      </div>
    </main>
  );
}