"use client";
import InfoTip from "@/components/InfoTip";


import { useState } from "react";
import { useRouter } from "next/navigation";
import { saveOnboardingData, getOnboardingData } from "@/lib/onboardingStorage";

export default function LimitationsPage() {
  const router = useRouter();

  const [limitations, setLimitations] = useState("");
  const [dislikedExercises, setDislikedExercises] = useState("");
  const [extraNotes, setExtraNotes] = useState("");

  function handleFinish() {
    saveOnboardingData({
      limitations,
      dislikedExercises,
      extraNotes,
    });

    console.log("Final onboarding data:", getOnboardingData());

    router.push("/plan");
  }

  return (
    <main className="min-h-screen bg-background px-6 py-10 text-foreground">
      <div className="mx-auto max-w-3xl">
        <p className="text-sm font-semibold text-primary">Step 6 of 6</p>
        <h1 className="mt-2 text-4xl font-bold">Anything we should avoid?</h1>
        <p className="mt-3 text-muted">
          This helps make the plan safer and more realistic.
        </p>

        <section className="mt-8 rounded-2xl border border-border bg-card p-6 shadow-sm">
          <label className="block">
          <span className="flex items-center text-xl font-semibold">
            Injuries or limitations
            <InfoTip text="Mention anything the plan should avoid, such as knee pain, shoulder pain, no jumping, or movements you have been told not to do." />
            </span>
            <textarea
              value={limitations}
              onChange={(e) => setLimitations(e.target.value)}
              placeholder="Example: knee pain, shoulder pain, no jumping, avoid deadlifts..."
              className="mt-4 min-h-28 w-full rounded-xl border border-border bg-background px-4 py-3 outline-none focus:border-primary"
            />
          </label>
        </section>

        
        <section className="mt-6 rounded-2xl border border-border bg-card p-6 shadow-sm">
          <label className="block">
            <span className="text-xl font-semibold">Anything else?</span>
            <textarea
              value={extraNotes}
              onChange={(e) => setExtraNotes(e.target.value)}
              placeholder="Example: I want workouts to feel beginner-friendly. I want simple gym instructions."
              className="mt-4 min-h-28 w-full rounded-xl border border-border bg-background px-4 py-3 outline-none focus:border-primary"
            />
          </label>
        </section>

        <div className="mt-8 flex justify-between">
          <button
            onClick={() => router.push("/onboarding/equipment")}
            className="rounded-xl border border-border bg-card px-6 py-3 font-semibold text-foreground"
          >
            Back
          </button>

          <button
            onClick={handleFinish}
            className="rounded-xl bg-primary px-6 py-3 font-semibold text-white transition hover:bg-primary-hover"
          >
            Generate my plan
          </button>
        </div>
      </div>
    </main>
  );
}