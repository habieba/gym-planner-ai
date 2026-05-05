"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { saveOnboardingData } from "@/lib/onboardingStorage";
import InfoTip from "@/components/InfoTip";

const experienceLevels = [
  "Beginner",
  "Some experience",
  "Intermediate",
  "Advanced",
];

export default function ExperiencePage() {
  const router = useRouter();
  const [experienceLevel, setExperienceLevel] = useState("");

  function handleNext() {
    if (!experienceLevel) {
      alert("Choose your experience level.");
      return;
    }

    saveOnboardingData({
      experienceLevel,
    });

    router.push("/onboarding/schedule");
  }

  return (
    <main className="min-h-screen bg-background px-6 py-10 text-foreground">
      <div className="mx-auto max-w-3xl">
        <p className="text-sm font-semibold text-primary">Step 3 of 6</p>
        <h1 className="mt-2 text-4xl font-bold">
          What is your experience level?
        </h1>
        <p className="mt-3 text-muted">
          This helps avoid plans that are too easy, too advanced, or unrealistic.
        </p>

        <section className="mt-8 rounded-2xl border border-border bg-card p-6 shadow-sm">
          <h2 className="flex items-center text-xl font-semibold">
            Training experience
            <InfoTip text="Beginner means you are still learning the basics. Some experience means you have trained before but may not be consistent. Intermediate means you know most gym movements. Advanced means you train seriously and can handle more volume." />
          </h2>

          <div className="mt-4 grid gap-3 sm:grid-cols-2">
            {experienceLevels.map((level) => (
              <button
                key={level}
                type="button"
                onClick={() => setExperienceLevel(level)}
                className={`rounded-xl border px-4 py-3 text-left transition ${
                  experienceLevel === level
                    ? "border-primary bg-primary text-white"
                    : "border-border bg-background text-foreground hover:border-primary"
                }`}
              >
                {level}
              </button>
            ))}
          </div>
        </section>

        <div className="mt-8 flex justify-between">
          <button
            onClick={() => router.push("/onboarding/focus")}
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