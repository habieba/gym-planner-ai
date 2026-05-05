import Link from "next/link";

export default function Home() {
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
          <Link
            href="/onboarding"
            className="rounded-xl bg-primary px-6 py-3 font-semibold text-white shadow-sm transition hover:bg-primary-hover"
          >
            Start planning
          </Link>

          <Link
            href="/dashboard"
            className="rounded-xl border border-border bg-card px-6 py-3 font-semibold text-foreground shadow-sm transition hover:bg-background"
          >
            View dashboard
          </Link>
        </div>
      </section>
    </main>
  );
}