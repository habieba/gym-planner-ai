"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { getExerciseById } from "@/lib/exerciseHelpers";

const ACTIVE_WORKOUT_KEY = "gym_active_workout";
const SCHEDULE_STORAGE_KEY = "gym_scheduled_workouts";
const WORKOUT_LOGS_KEY = "gym_workout_logs";

export default function WorkoutPage() {
    const [workout, setWorkout] = useState(null);
    const [openDetailsId, setOpenDetailsId] = useState(null);
    const [openAlternatesId, setOpenAlternatesId] = useState(null);
    const [previewAlternateId, setPreviewAlternateId] = useState(null);
    const [notes, setNotes] = useState("");

  useEffect(() => {
    const savedWorkout = localStorage.getItem(ACTIVE_WORKOUT_KEY);

    if (savedWorkout) {
      setWorkout(JSON.parse(savedWorkout));
    }
  }, []);

  function saveUpdatedWorkout(updatedWorkout) {
    setWorkout(updatedWorkout);
    localStorage.setItem(ACTIVE_WORKOUT_KEY, JSON.stringify(updatedWorkout));

    const savedSchedule = JSON.parse(
      localStorage.getItem(SCHEDULE_STORAGE_KEY) || "[]"
    );

    const updatedSchedule = savedSchedule.map((scheduledWorkout) =>
      scheduledWorkout.id === updatedWorkout.id ? updatedWorkout : scheduledWorkout
    );

    localStorage.setItem(SCHEDULE_STORAGE_KEY, JSON.stringify(updatedSchedule));
  }

  function chooseAlternateExercise(exerciseIndex, alternateExerciseId) {
    if (!workout) return;
  
    const updatedExercises = workout.exercises.map((exercise, index) => {
      if (index !== exerciseIndex) return exercise;
  
      return {
        ...exercise,
        exerciseId: alternateExerciseId,
      };
    });
  
    const updatedWorkout = {
      ...workout,
      exercises: updatedExercises,
    };
  
    saveUpdatedWorkout(updatedWorkout);
    setOpenAlternatesId(null);
    setOpenDetailsId(null);
    setPreviewAlternateId(null);
  }

  function markWorkoutCompleted() {
    if (!workout) return;

    const completedAt = new Date().toISOString();

    const workoutLog = {
      id: `log-${Date.now()}`,
      workoutId: workout.id,
      title: workout.title,
      date: workout.date,
      completedAt,
      notes,
      exercises: workout.exercises,
    };

    const existingLogs = JSON.parse(
      localStorage.getItem(WORKOUT_LOGS_KEY) || "[]"
    );

    localStorage.setItem(
      WORKOUT_LOGS_KEY,
      JSON.stringify([...existingLogs, workoutLog])
    );

    const updatedWorkout = {
      ...workout,
      status: "completed",
      completedAt,
    };

    saveUpdatedWorkout(updatedWorkout);
    alert("Workout marked as completed.");
  }

  function undoWorkoutCompleted() {
    if (!workout) return;
  
    const updatedWorkout = {
      ...workout,
      status: "scheduled",
      completedAt: null,
    };
  
    saveUpdatedWorkout(updatedWorkout);
  
    const existingLogs = JSON.parse(
      localStorage.getItem(WORKOUT_LOGS_KEY) || "[]"
    );
  
    const updatedLogs = existingLogs.filter(
      (log) => !(log.workoutId === workout.id && log.date === workout.date)
    );
  
    localStorage.setItem(WORKOUT_LOGS_KEY, JSON.stringify(updatedLogs));
  }

  if (!workout) {
    return (
      <main className="min-h-screen bg-background px-6 py-10 text-foreground">
        <div className="mx-auto max-w-4xl">
          <h1 className="text-4xl font-bold">No workout selected</h1>
          <p className="mt-3 text-muted">
            Go back to your schedule and choose a workout.
          </p>

          <Link
            href="/schedule"
            className="mt-6 inline-block rounded-xl bg-primary px-6 py-3 font-semibold text-white transition hover:bg-primary-hover"
          >
            Back to schedule
          </Link>
        </div>
      </main>
    );
  }

  return (
    <main className="min-h-screen bg-background px-6 py-10 text-foreground">
      <div className="mx-auto max-w-5xl">
        <div className="flex flex-col justify-between gap-4 sm:flex-row sm:items-center">
          <div>
            <p className="text-sm font-semibold text-primary">
              {workout.date} • {workout.startTime}
            </p>
            <h1 className="mt-2 text-4xl font-bold">{workout.title}</h1>
            <p className="mt-3 text-muted">
              {workout.durationMinutes} min • {workout.exercises.length} exercises
            </p>
          </div>

          <Link
            href="/schedule"
            className="rounded-xl border border-border bg-card px-5 py-3 text-center font-semibold text-foreground shadow-sm transition hover:border-primary"
          >
            Back to schedule
          </Link>
        </div>

        {workout.status === "completed" && (
          <section className="mt-8 rounded-2xl border border-green-200 bg-green-100 p-5 text-green-800">
            <p className="font-semibold">Completed</p>
            <p className="mt-1 text-sm">
              This workout has been marked as completed.
            </p>
          </section>
        )}

        <section className="mt-8 grid gap-5">
          {workout.exercises.map((plannedExercise, index) => {
            const exercise = getExerciseById(plannedExercise.exerciseId);
            const isDetailsOpen = openDetailsId === `${plannedExercise.exerciseId}-${index}`;
            const isAlternatesOpen =
              openAlternatesId === `${plannedExercise.exerciseId}-${index}`;

            const validAlternates =
              exercise?.alternatives
                ?.map((alternateId) => getExerciseById(alternateId))
                .filter(Boolean) || [];

            return (
              <article
                key={`${plannedExercise.exerciseId}-${index}`}
                className="rounded-2xl border border-border bg-card p-6 shadow-sm"
              >
                <div className="flex flex-col justify-between gap-4 sm:flex-row sm:items-start">
                  <div>
                    <p className="text-sm font-semibold text-primary">
                      Exercise {index + 1}
                    </p>

                    <h2 className="mt-1 text-2xl font-bold">
                      {exercise ? exercise.name : plannedExercise.exerciseId}
                    </h2>

                    <p className="mt-2 text-muted">
                      {plannedExercise.sets} sets • {plannedExercise.reps} reps
                    </p>

                    {exercise && (
                      <div className="mt-3 flex flex-wrap gap-2">
                        {exercise.primaryMuscles.map((muscle) => (
                          <span
                            key={muscle}
                            className="rounded-full border border-border bg-background px-3 py-1 text-xs font-medium text-muted"
                          >
                            {muscle}
                          </span>
                        ))}

                        <span className="rounded-full border border-border bg-background px-3 py-1 text-xs font-medium text-muted">
                          {exercise.difficulty}
                        </span>
                      </div>
                    )}
                  </div>

                  {exercise && (
                    <Link
                      href={`/exercises/${exercise.id}`}
                      className="rounded-xl border border-border bg-background px-4 py-2 text-center text-sm font-semibold text-foreground transition hover:border-primary"
                    >
                      View full guide
                    </Link>
                  )}
                </div>

                <div className="mt-5 grid gap-3 sm:grid-cols-2">
                  <button
                    type="button"
                    onClick={() =>
                      setOpenDetailsId(
                        isDetailsOpen ? null : `${plannedExercise.exerciseId}-${index}`
                      )
                    }
                    className="flex w-full items-center justify-between rounded-xl border border-border bg-background px-4 py-3 text-left font-semibold transition hover:border-primary"
                  >
                    <span>Instructions, tips, and mistakes</span>
                    <span>{isDetailsOpen ? "▲" : "▼"}</span>
                  </button>

                  <button
                    type="button"
                    onClick={() =>
                      setOpenAlternatesId(
                        isAlternatesOpen
                          ? null
                          : `${plannedExercise.exerciseId}-${index}`
                      )
                    }
                    className="flex w-full items-center justify-between rounded-xl border border-border bg-background px-4 py-3 text-left font-semibold transition hover:border-primary"
                  >
                    <span>Alternate exercises</span>
                    <span>{isAlternatesOpen ? "▲" : "▼"}</span>
                  </button>
                </div>

                {isDetailsOpen && exercise && (
                  <div className="mt-5 grid gap-5 lg:grid-cols-3">
                    <InfoBox title="Instructions" items={exercise.instructions} />
                    <InfoBox
                      title="Common mistakes"
                      items={exercise.commonMistakes}
                    />
                    <InfoBox title="Tips" items={exercise.tips} />
                  </div>
                )}

                {isDetailsOpen && !exercise && (
                  <div className="mt-5 rounded-xl border border-border bg-background p-4 text-muted">
                    Exercise details not found in your library yet.
                  </div>
                )}

                {isAlternatesOpen && (
                <div className="mt-5 rounded-xl border border-border bg-background p-4">
                    <h3 className="font-semibold">Choose an alternate exercise</h3>
                    <p className="mt-1 text-sm text-muted">
                    Preview the movement before replacing your current exercise.
                    </p>

                    {validAlternates.length > 0 ? (
                    <div className="mt-4 grid gap-3">
                        {validAlternates.map((alternate) => {
                        const previewKey = `${plannedExercise.exerciseId}-${index}-${alternate.id}`;
                        const isPreviewOpen = previewAlternateId === previewKey;

                        return (
                            <div
                            key={alternate.id}
                            className="rounded-xl border border-border bg-card p-4"
                            >
                            <div className="flex flex-col justify-between gap-3 sm:flex-row sm:items-start">
                                <div>
                                <p className="font-semibold">{alternate.name}</p>
                                <p className="mt-1 text-sm text-muted">
                                    {alternate.primaryMuscles.join(", ")} • {alternate.difficulty}
                                </p>

                                {alternate.equipment?.length > 0 && (
                                    <p className="mt-1 text-xs text-muted">
                                    Equipment: {alternate.equipment.join(", ")}
                                    </p>
                                )}
                                </div>

                                <div className="flex gap-2">
                                <button
                                    type="button"
                                    onClick={() =>
                                    setPreviewAlternateId(isPreviewOpen ? null : previewKey)
                                    }
                                    className="rounded-lg border border-border bg-background px-3 py-2 text-sm font-semibold text-foreground transition hover:border-primary"
                                >
                                    {isPreviewOpen ? "Hide" : "Preview"}
                                </button>

                                <button
                                    type="button"
                                    onClick={() => chooseAlternateExercise(index, alternate.id)}
                                    className="rounded-lg bg-primary px-3 py-2 text-sm font-semibold text-white transition hover:bg-primary-hover"
                                >
                                    Use this exercise
                                </button>
                                </div>
                            </div>

                            {isPreviewOpen && (
                                <div className="mt-4 grid gap-4 lg:grid-cols-3">
                                <InfoBox title="Instructions" items={alternate.instructions} />
                                <InfoBox
                                    title="Common mistakes"
                                    items={alternate.commonMistakes}
                                />
                                <InfoBox title="Tips" items={alternate.tips} />
                                </div>
                            )}
                            </div>
                        );
                        })}
                    </div>
                    ) : (
                    <p className="mt-3 text-sm text-muted">
                        No alternate exercises available yet. Add more exercise IDs to this
                        exercise’s alternatives list in your library.
                    </p>
                    )}
                </div>
                )}
              </article>
            );
          })}
        </section>

        <section className="mt-8 rounded-2xl border border-border bg-card p-6 shadow-sm">
          <h2 className="text-2xl font-semibold">Workout notes</h2>
          <p className="mt-2 text-sm text-muted">
            Optional. Add anything useful, like what felt too easy, too hard, or
            what you changed.
          </p>

          <textarea
            value={notes}
            onChange={(e) => setNotes(e.target.value)}
            placeholder="Example: Leg press felt too easy. Increase weight next time."
            className="mt-4 min-h-28 w-full rounded-xl border border-border bg-background px-4 py-3 outline-none focus:border-primary"
          />
        </section>

        <div className="mt-8 flex justify-end">
            {workout.status === "completed" ? (
                <button
                type="button"
                onClick={undoWorkoutCompleted}
                className="rounded-xl border border-border bg-card px-6 py-3 font-semibold text-foreground transition hover:border-primary"
                >
                Undo completed
                </button>
            ) : (
                <button
                type="button"
                onClick={markWorkoutCompleted}
                className="rounded-xl bg-primary px-6 py-3 font-semibold text-white transition hover:bg-primary-hover"
                >
                Mark workout completed
                </button>
            )}
            </div>
      </div>
    </main>
  );
}

function InfoBox({ title, items }) {
  return (
    <div className="rounded-xl border border-border bg-background p-4">
      <h3 className="font-semibold">{title}</h3>

      <ul className="mt-3 space-y-2 text-sm text-muted">
        {items.map((item) => (
          <li key={item}>• {item}</li>
        ))}
      </ul>
    </div>
  );
}