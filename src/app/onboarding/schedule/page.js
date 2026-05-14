"use client";
import InfoTip from "@/components/InfoTip";


import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import {
  getOnboardingData,
  normalizeDaysPerWeek,
  saveOnboardingData,
} from "@/lib/onboardingStorage";

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
  const [daySelectionMessage, setDaySelectionMessage] = useState("");

  useEffect(() => {
    const savedData = getOnboardingData();
    const timeoutId = window.setTimeout(() => {
      const savedDaysPerWeek = normalizeDaysPerWeek(savedData.daysPerWeek);
      const savedAvailableDays = (savedData.availableDays || []).slice(
        0,
        savedDaysPerWeek
      );

      setDaysPerWeek(savedDaysPerWeek);
      setAvailableDays(savedAvailableDays);
      setPreferredTime(savedData.preferredTime || "18:00");
      setWorkoutLengthPreference(savedData.workoutLengthPreference || "");

      if (savedAvailableDays.length < savedDaysPerWeek) {
        setDaySelectionMessage(
          `Choose ${savedDaysPerWeek - savedAvailableDays.length} more training day${
            savedDaysPerWeek - savedAvailableDays.length === 1 ? "" : "s"
          }.`
        );
      }
    }, 0);

    return () => window.clearTimeout(timeoutId);
  }, []);

  function toggleDay(day) {
    setAvailableDays((current) => {
      setDaySelectionMessage("");

      if (current.includes(day)) {
        return current.filter((item) => item !== day);
      }

      if (current.length >= daysPerWeek) {
        setDaySelectionMessage(
          `You can choose ${daysPerWeek} day${daysPerWeek === 1 ? "" : "s"} for ${daysPerWeek} workout${
            daysPerWeek === 1 ? "" : "s"
          } per week.`
        );
        return current;
      }

      return [...current, day];
    });
  }

  function updateDaysPerWeek(value) {
    const nextDaysPerWeek = normalizeDaysPerWeek(value);

    setDaysPerWeek(nextDaysPerWeek);
    setAvailableDays((current) => current.slice(0, nextDaysPerWeek));
    setDaySelectionMessage("");
  }

  function validateScheduleStep() {
    if (availableDays.length !== daysPerWeek) {
      const remainingDays = daysPerWeek - availableDays.length;
      const message =
        remainingDays > 0
          ? `Choose ${remainingDays} more training day${
              remainingDays === 1 ? "" : "s"
            } before saving.`
          : `Choose only ${daysPerWeek} training day${
              daysPerWeek === 1 ? "" : "s"
            } before saving.`;

      setDaySelectionMessage(message);
      alert(message);
      return false;
    }

    if (!workoutLengthPreference) {
      alert("Choose your workout length preference.");
      return false;
    }

    return true;
  }

  function saveScheduleStep() {
    return saveOnboardingData({
      daysPerWeek,
      availableDays,
      preferredTime,
      workoutLengthPreference,
    });
  }

  function handleNext() {
    if (!validateScheduleStep()) {
      return;
    }

    saveScheduleStep();

    router.push("/onboarding/equipment");
  }

  function handleExit() {
    if (!validateScheduleStep()) {
      return;
    }

    saveScheduleStep();

    router.push("/plan");
  }

  return (
    <main className="min-h-screen bg-background px-6 py-10 text-foreground">
      <div className="mx-auto max-w-3xl">
        <div className="flex justify-between">
          <button
            type="button"
            onClick={handleExit}
            className="text-sm font-semibold text-muted transition hover:text-primary"
          >
            Save and exit
          </button>
        </div>

        <p className="mt-8 text-sm font-semibold text-primary">Step 4 of 6</p>
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
              onChange={(e) => updateDaysPerWeek(e.target.value)}
              className="mt-2 w-full rounded-xl border border-border bg-background px-4 py-3 outline-none focus:border-primary"
            />
          </label>

          <div className="mt-6">
          <p className="flex items-center text-sm font-medium text-muted">
            Available days
            <InfoTip text="Choose the days that usually work for you. The app will use these when building your weekly schedule." />
            </p>
            <p className="mt-1 text-sm text-muted">
              Choose exactly {daysPerWeek} day{daysPerWeek === 1 ? "" : "s"}.
            </p>
            {daySelectionMessage && (
              <p className="mt-2 rounded-xl border border-amber-200 bg-amber-100 px-4 py-2 text-sm font-medium text-amber-800">
                {daySelectionMessage}
              </p>
            )}
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
