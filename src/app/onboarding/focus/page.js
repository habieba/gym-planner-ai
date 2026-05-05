"use client";
import InfoTip from "@/components/InfoTip";


import { useState } from "react";
import { useRouter } from "next/navigation";
import { saveOnboardingData } from "@/lib/onboardingStorage";

const focusAreas = [
  "Full body",
  "Glutes",
  "Legs",
  "Core",
  "Back",
  "Chest",
  "Shoulders",
  "Arms",
  "Leaner waist / overall fat loss",
];

export default function FocusPage() {
  const router = useRouter();
  const [selectedFocusAreas, setSelectedFocusAreas] = useState([]);

  function toggleFocus(area) {
    setSelectedFocusAreas((current) =>
      current.includes(area)
        ? current.filter((item) => item !== area)
        : [...current, area]
    );
  }

  function handleNext() {
    if (selectedFocusAreas.length === 0) {
      alert("Choose at least one focus area.");
      return;
    }

    saveOnboardingData({
      focusAreas: selectedFocusAreas,
    });

    router.push("/onboarding/experience");
  }

  return (
    <main className="min-h-screen bg-background px-6 py-10 text-foreground">
      <div className="mx-auto max-w-3xl">
        <p className="text-sm font-semibold text-primary">Step 2 of 6</p>
        <h1 className="mt-2 text-4xl font-bold">What do you want to focus on?</h1>
        <p className="mt-3 text-muted">
          This helps the plan prioritize the right muscle groups and training style.
        </p>

        <section className="mt-8 rounded-2xl border border-border bg-card p-6 shadow-sm">
            <h2 className="flex items-center text-xl font-semibold">
            Focus areas
            <InfoTip text="Pick the areas you want your workout plan to emphasize. This does not mean only training these areas; it means the plan will prioritize them." />
            </h2>
            <div className="grid gap-3 sm:grid-cols-2">
            {focusAreas.map((area) => (
              <button
                key={area}
                type="button"
                onClick={() => toggleFocus(area)}
                className={`rounded-xl border px-4 py-3 text-left transition ${
                  selectedFocusAreas.includes(area)
                    ? "border-primary bg-primary text-white"
                    : "border-border bg-background text-foreground hover:border-primary"
                }`}
              >
                {area}
              </button>
            ))}
          </div>
        </section>

        <div className="mt-8 flex justify-between">
          <button
            onClick={() => router.push("/onboarding/goal")}
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