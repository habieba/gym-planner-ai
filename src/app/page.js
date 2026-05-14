"use client";

import { useEffect, useState } from "react";
import Link from "next/link";

const ONBOARDING_KEY = "gym_onboarding";
const SCHEDULE_KEY = "gym_scheduled_workouts";

export default function Home() {
  const [hasOnboarding, setHasOnboarding] = useState(false);
  const [hasSchedule, setHasSchedule] = useState(false);
  const [isLoaded, setIsLoaded] = useState(false);

  useEffect(() => {
    const timeoutId = window.setTimeout(() => {
      const savedOnboarding = localStorage.getItem(ONBOARDING_KEY);
      const savedSchedule = localStorage.getItem(SCHEDULE_KEY);

      setHasOnboarding(Boolean(savedOnboarding));
      setHasSchedule(Boolean(savedSchedule));
      setIsLoaded(true);
    }, 0);

    return () => window.clearTimeout(timeoutId);
  }, []);

  return (
    <main className="min-h-screen bg-background text-foreground">
      <section className="mx-auto flex min-h-screen max-w-6xl flex-col items-center justify-center px-6 text-center">
        <p className="mb-4 rounded-full border border-border bg-card px-4 py-2 text-sm text-muted shadow-sm">
          AI workout planning, scheduling, and progress tracking
        </p>

        <h1 className="max-w-4xl text-5xl font-bold tracking-tight md:text-7xl">
          Build a workout plan that actually fits your life.
        </h1>

        <p className="mt-6 max-w-2xl text-lg text-muted">
          get a personalized gym plan tailored for you, schedule your
          workouts, log your progress, and adjust your next week based on real
          results.
        </p>

        <div className="mt-10 flex flex-col gap-4 sm:flex-row">
          {hasOnboarding ? (
            <>
              <Link
                href="/dashboard"
                className="rounded-xl bg-primary px-6 py-3 font-semibold text-white shadow-sm transition hover:bg-primary-hover"
              >
                Continue to dashboard
              </Link>

              <Link
                href="/schedule"
                className="rounded-xl border border-border bg-card px-6 py-3 font-semibold text-foreground shadow-sm transition hover:bg-background"
              >
                View schedule
              </Link>

              <Link
                href="/onboarding/goal"
                className="rounded-xl border border-border bg-card px-6 py-3 font-semibold text-muted shadow-sm transition hover:bg-background hover:text-foreground"
              >
                Edit quiz
              </Link>
            </>
          ) : (
            <>
              <Link
                href="/onboarding"
                className="rounded-xl bg-primary px-6 py-3 font-semibold text-white shadow-sm transition hover:bg-primary-hover"
              >
                Start planning
              </Link>

              {isLoaded && hasSchedule && (
                <Link
                  href="/schedule"
                  className="rounded-xl border border-border bg-card px-6 py-3 font-semibold text-foreground shadow-sm transition hover:bg-background"
                >
                  View schedule
                </Link>
              )}
            </>
          )}
        </div>
      </section>
    </main>
  );
}
