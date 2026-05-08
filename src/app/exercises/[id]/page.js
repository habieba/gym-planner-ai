import Link from "next/link";
import { exerciseLibrary } from "@/data/exerciseLibrary";

export default async function ExerciseGuidePage({ params }) {
  const { id } = await params;

  const exercise = exerciseLibrary.find((item) => item.id === id);

  if (!exercise) {
    return (
      <main className="min-h-screen bg-background px-6 py-10 text-foreground">
        <div className="mx-auto max-w-4xl">
          <h1 className="text-4xl font-bold">Exercise not found</h1>
          <p className="mt-3 text-muted">
            This exercise is not in your library yet.
          </p>

          <Link
            href="/workout"
            className="mt-6 inline-block rounded-xl bg-primary px-6 py-3 font-semibold text-white"
          >
            Back to workout
          </Link>
        </div>
      </main>
    );
  }

  const alternateExercises =
    exercise.alternatives
      ?.map((alternateId) =>
        exerciseLibrary.find((item) => item.id === alternateId)
      )
      .filter(Boolean) || [];

  return (
    <main className="min-h-screen bg-background px-6 py-10 text-foreground">
      <div className="mx-auto max-w-5xl">
        <Link href="/workout" className="text-sm font-semibold text-primary">
          ← Back to workout
        </Link>

        <section className="mt-8 rounded-2xl border border-border bg-card p-6 shadow-sm">
          <p className="text-sm font-semibold text-primary">
            {exercise.category}
          </p>

          <h1 className="mt-2 text-5xl font-bold">{exercise.name}</h1>

          <div className="mt-5 flex flex-wrap gap-2">
            {exercise.primaryMuscles.map((muscle) => (
              <span
                key={muscle}
                className="rounded-full border border-border bg-background px-3 py-1 text-sm font-medium text-muted"
              >
                {muscle}
              </span>
            ))}

            <span className="rounded-full border border-border bg-background px-3 py-1 text-sm font-medium text-muted">
              {exercise.difficulty}
            </span>
          </div>

          <div className="mt-6 rounded-2xl border border-dashed border-border bg-background p-8 text-center">
            <p className="font-semibold">Media placeholder</p>
            <p className="mt-2 text-sm text-muted">
              Later, this is where your image, GIF, or embedded video will go.
            </p>
          </div>
        </section>

        <section className="mt-8 grid gap-5 lg:grid-cols-3">
          <GuideBox title="Instructions" items={exercise.instructions} />
          <GuideBox title="Common mistakes" items={exercise.commonMistakes} />
          <GuideBox title="Tips" items={exercise.tips} />
        </section>

        <section className="mt-8 rounded-2xl border border-border bg-card p-6 shadow-sm">
          <h2 className="text-2xl font-semibold">Alternate exercises</h2>

          {alternateExercises.length > 0 ? (
            <div className="mt-4 grid gap-3 sm:grid-cols-2">
              {alternateExercises.map((alternate) => (
                <Link
                  key={alternate.id}
                  href={`/exercises/${alternate.id}`}
                  className="rounded-xl border border-border bg-background p-4 transition hover:border-primary"
                >
                  <p className="font-semibold">{alternate.name}</p>
                  <p className="mt-1 text-sm text-muted">
                    {alternate.primaryMuscles.join(", ")} •{" "}
                    {alternate.difficulty}
                  </p>
                </Link>
              ))}
            </div>
          ) : (
            <p className="mt-3 text-muted">
              No alternate exercises available yet.
            </p>
          )}
        </section>
      </div>
    </main>
  );
}

function GuideBox({ title, items }) {
  return (
    <div className="rounded-2xl border border-border bg-card p-6 shadow-sm">
      <h2 className="text-xl font-semibold">{title}</h2>

      <ul className="mt-4 space-y-3 text-muted">
        {items.map((item) => (
          <li key={item}>• {item}</li>
        ))}
      </ul>
    </div>
  );
}