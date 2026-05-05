"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { saveOnboardingData } from "@/lib/onboardingStorage";
import InfoTip from "@/components/InfoTip";

const trainingLocations = [
  "Commercial gym",
  "Home gym",
  "At home",
  "Outdoors",
  "Mixed",
];

export default function EquipmentPage() {
  const router = useRouter();
  const [trainingLocation, setTrainingLocation] = useState("");

  function handleNext() {
    if (!trainingLocation) {
      alert("Choose where you will usually train.");
      return;
    }

    saveOnboardingData({
      trainingLocation,
    });

    router.push("/onboarding/limitations");
  }

  return (
    <main className="min-h-screen bg-background px-6 py-10 text-foreground">
      <div className="mx-auto max-w-3xl">
        <p className="text-sm font-semibold text-primary">Step 5 of 6</p>
        <h1 className="mt-2 text-4xl font-bold">Where will you train?</h1>
        <p className="mt-3 text-muted">
          The plan will start with your usual training location. Later, you will
          be able to swap exercises when something is unavailable.
        </p>

        <section className="mt-8 rounded-2xl border border-border bg-card p-6 shadow-sm">
          <h2 className="flex items-center text-xl font-semibold">
            Training location
            <InfoTip text="Choose where you will train most often. You do not need to list every piece of equipment now because the app will eventually suggest alternate exercises when needed." />
          </h2>

          <div className="mt-4 grid gap-3 sm:grid-cols-2">
            {trainingLocations.map((location) => (
              <button
                key={location}
                type="button"
                onClick={() => setTrainingLocation(location)}
                className={`rounded-xl border px-4 py-3 text-left transition ${
                  trainingLocation === location
                    ? "border-primary bg-primary text-white"
                    : "border-border bg-background text-foreground hover:border-primary"
                }`}
              >
                {location}
              </button>
            ))}
          </div>
        </section>

        <div className="mt-8 flex justify-between">
          <button
            onClick={() => router.push("/onboarding/schedule")}
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