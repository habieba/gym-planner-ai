"use client";
import InfoTip from "@/components/InfoTip";


import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import {
  getOnboardingData,
  saveOnboardingData,
} from "@/lib/onboardingStorage";

const primaryGoals = [
  "Build muscle",
  "Lose fat",
  "Build strength",
  "Improve stamina",
  "Body recomposition",
  "General fitness",
];

const secondaryGoals = [
  "Build glutes",
  "Tone/build arms",
  "Improve core",
  "Improve cardio",
  "Become more active",
  "Improve mobility",
  "Build gym confidence",
  "Stay consistent",
];

export default function GoalPage() {
  const router = useRouter();

  const [primaryGoal, setPrimaryGoal] = useState("");
  const [selectedSecondaryGoals, setSelectedSecondaryGoals] = useState([]);
  const [goalDescription, setGoalDescription] = useState("");

  useEffect(() => {
    const savedData = getOnboardingData();
    const timeoutId = window.setTimeout(() => {
      setPrimaryGoal(savedData.primaryGoal || "");
      setSelectedSecondaryGoals(savedData.secondaryGoals || []);
      setGoalDescription(savedData.goalDescription || "");
    }, 0);

    return () => window.clearTimeout(timeoutId);
  }, []);

  function toggleSecondaryGoal(goal) {
    setSelectedSecondaryGoals((current) =>
      current.includes(goal)
        ? current.filter((item) => item !== goal)
        : [...current, goal]
    );
  }

  function handleNext() {
    if (!primaryGoal) {
      alert("Choose your main goal first.");
      return;
    }

    saveOnboardingData({
      primaryGoal,
      secondaryGoals: selectedSecondaryGoals,
      goalDescription,
    });

    router.push("/onboarding/focus");
  }

  function handleExit() {
    saveOnboardingData({
      primaryGoal,
      secondaryGoals: selectedSecondaryGoals,
      goalDescription,
    });

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

        <p className="mt-8 text-sm font-semibold text-primary">Step 1 of 6</p>
        <h1 className="mt-2 text-4xl font-bold">What is your goal?</h1>
        <p className="mt-3 text-muted">
          Start with your main goal, then add any extra details you care about.
        </p>

        <section className="mt-8 rounded-2xl border border-border bg-card p-6 shadow-sm">
            <h2 className="flex items-center text-xl font-semibold">
            Main goal
            <InfoTip text="Choose the main result you want your plan to prioritize. You can still add extra goals below." />
            </h2>
          <div className="mt-4 grid gap-3 sm:grid-cols-2">
            {primaryGoals.map((goal) => (
              <button
                key={goal}
                type="button"
                onClick={() => setPrimaryGoal(goal)}
                className={`rounded-xl border px-4 py-3 text-left transition ${
                  primaryGoal === goal
                    ? "border-primary bg-primary text-white"
                    : "border-border bg-background text-foreground hover:border-primary"
                }`}
              >
                {goal}
              </button>
            ))}
          </div>
        </section>

        <section className="mt-6 rounded-2xl border border-border bg-card p-6 shadow-sm">
            <h2 className="flex items-center text-xl font-semibold">
            Secondary goals
            <InfoTip text="These are extra things you care about. For example, you may want to lose fat as your main goal while also building glutes or improving core strength." />
            </h2>
          <p className="mt-1 text-sm text-muted">Choose all that apply.</p>

          <div className="mt-4 grid gap-3 sm:grid-cols-2">
            {secondaryGoals.map((goal) => (
              <button
                key={goal}
                type="button"
                onClick={() => toggleSecondaryGoal(goal)}
                className={`rounded-xl border px-4 py-3 text-left transition ${
                  selectedSecondaryGoals.includes(goal)
                    ? "border-primary bg-primary text-white"
                    : "border-border bg-background text-foreground hover:border-primary"
                }`}
              >
                {goal}
              </button>
            ))}
          </div>
        </section>

        <section className="mt-6 rounded-2xl border border-border bg-card p-6 shadow-sm">
            <h2 className="flex items-center text-xl font-semibold">
            Describe it in your own words
            <InfoTip text="Use this like you would use ChatGPT. Add personal details, preferences, or specific goals that do not fit the buttons." />
            </h2>

          <textarea
            value={goalDescription}
            onChange={(e) => setGoalDescription(e.target.value)}
            placeholder="Example: I want to lose fat, grow my glutes, and feel stronger without spending too long in the gym."
            className="mt-4 min-h-32 w-full rounded-xl border border-border bg-background px-4 py-3 outline-none focus:border-primary"
          />
        </section>

        <div className="mt-8 flex justify-end">
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
