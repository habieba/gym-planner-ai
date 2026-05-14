"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import {
  getExerciseById,
  getTopAlternateExercises,
} from "@/lib/exerciseHelpers";
import { getOnboardingData } from "@/lib/onboardingStorage";
import {
  ACTIVE_WORKOUT_KEY,
  isTodayOrPast,
  removeWorkoutRecord,
  saveWorkoutRecord,
  updateLegacyScheduledWorkout,
  updateTemplateWorkoutExercises,
} from "@/lib/scheduleStorage";
import {
  applyProgressionSuggestion,
  dismissProgressionSuggestion,
  getExerciseTargetText,
  normalizePlannedExercise,
  recalculateProgressionFromLogs,
  updateExerciseProgression,
} from "@/lib/progressionHelpers";

const WORKOUT_LOGS_KEY = "gym_workout_logs";

export default function WorkoutPage() {
  const [workout, setWorkout] = useState(null);
  const [profile, setProfile] = useState({});
  const [openDetailsId, setOpenDetailsId] = useState(null);
  const [openAlternatesId, setOpenAlternatesId] = useState(null);
  const [previewAlternateId, setPreviewAlternateId] = useState(null);
  const [notes, setNotes] = useState("");
  const [exerciseCompletions, setExerciseCompletions] = useState({});

  useEffect(() => {
    const savedWorkout = localStorage.getItem(ACTIVE_WORKOUT_KEY);
    const savedProfile = getOnboardingData();
    const timeoutId = window.setTimeout(() => {
      setProfile(savedProfile);

      if (savedWorkout) {
        const parsedWorkout = JSON.parse(savedWorkout);
        const normalizedExercises = parsedWorkout.exercises.map((exercise) =>
          normalizePlannedExercise(exercise)
        );
        setWorkout({
          ...parsedWorkout,
          exercises: normalizedExercises,
        });
        setExerciseCompletions(
          Object.fromEntries(
            normalizedExercises.map((exercise) => [
              exercise.exerciseId,
              Boolean(
                parsedWorkout.exerciseCompletions?.find(
                  (item) => item.exerciseId === exercise.exerciseId
                )?.completed
              ),
            ])
          )
        );
      }
    }, 0);

    return () => window.clearTimeout(timeoutId);
  }, []);

  function saveUpdatedWorkout(updatedWorkout) {
    setWorkout(updatedWorkout);
    localStorage.setItem(ACTIVE_WORKOUT_KEY, JSON.stringify(updatedWorkout));
    updateLegacyScheduledWorkout(updatedWorkout);
  }

  function updateWorkoutExercises(updater) {
    if (!workout) return;

    const updatedExercises = updater(workout.exercises).map((exercise) =>
      normalizePlannedExercise(exercise)
    );
    const updatedWorkout = {
      ...workout,
      exercises: updatedExercises,
    };

    updateTemplateWorkoutExercises(workout.id, () => updatedExercises);
    saveUpdatedWorkout(updatedWorkout);
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
  
    updateTemplateWorkoutExercises(workout.id, () => updatedExercises);
    saveUpdatedWorkout(updatedWorkout);
    setOpenAlternatesId(null);
    setOpenDetailsId(null);
    setPreviewAlternateId(null);
  }

  function getWorkoutLogs() {
    try {
      return JSON.parse(localStorage.getItem(WORKOUT_LOGS_KEY) || "[]");
    } catch {
      return [];
    }
  }

  function saveWorkoutLogs(logs) {
    localStorage.setItem(WORKOUT_LOGS_KEY, JSON.stringify(logs));
  }

  function getExerciseCompletionList(exercises = workout?.exercises || []) {
    return exercises.map((plannedExercise) => ({
      exerciseId: plannedExercise.exerciseId,
      completed: Boolean(exerciseCompletions[plannedExercise.exerciseId]),
    }));
  }

  function toggleExerciseCompleted(exerciseId) {
    setExerciseCompletions((current) => ({
      ...current,
      [exerciseId]: !current[exerciseId],
    }));
  }

  function completeWorkout() {
    if (!workout) return;
    if (!isTodayOrPast(workout.date)) return;

    const completedAt = new Date().toISOString();
    const exerciseCompletionList = getExerciseCompletionList();
    const updatedExercises = workout.exercises.map((plannedExercise) =>
      updateExerciseProgression(
        plannedExercise,
        Boolean(exerciseCompletions[plannedExercise.exerciseId])
      )
    );

    const workoutLog = {
      id: `${workout.date}-${workout.id}`,
      workoutId: workout.id,
      title: workout.title,
      date: workout.date,
      status: "completed",
      completedAt,
      notes,
      exerciseCompletions: exerciseCompletionList,
      exercises: workout.exercises,
    };

    const existingLogs = getWorkoutLogs();

    saveWorkoutLogs([
      ...existingLogs.filter(
        (log) => !(log.workoutId === workout.id && log.date === workout.date)
      ),
      workoutLog,
    ]);

    saveWorkoutRecord(workout, {
      status: "completed",
      completedAt,
      notes,
      exerciseCompletions: exerciseCompletionList,
    });

    const updatedWorkout = {
      ...workout,
      status: "completed",
      completedAt,
      notes,
      exerciseCompletions: exerciseCompletionList,
    };

    updateTemplateWorkoutExercises(workout.id, () => updatedExercises);
    saveUpdatedWorkout(updatedWorkout);
    alert("Workout marked as completed.");
  }

  function undoWorkoutCompleted() {
    if (!workout) return;
    if (!isTodayOrPast(workout.date)) return;
  
    const updatedWorkout = {
      ...workout,
      status: "scheduled",
      completedAt: null,
      exerciseCompletions: getExerciseCompletionList().map((item) => ({
        ...item,
        completed: false,
      })),
    };
  
    setExerciseCompletions(
      Object.fromEntries(
        updatedWorkout.exerciseCompletions.map((item) => [
          item.exerciseId,
          item.completed,
        ])
      )
    );
    saveUpdatedWorkout(updatedWorkout);
  
    const existingLogs = getWorkoutLogs();
  
    const updatedLogs = existingLogs.filter(
      (log) => !(log.workoutId === workout.id && log.date === workout.date)
    );

    saveWorkoutLogs(updatedLogs);
    removeWorkoutRecord(workout);

    const remainingWorkoutLogs = updatedLogs
      .filter((log) => log.workoutId === workout.id)
      .sort((a, b) => (a.date || "").localeCompare(b.date || ""));
    const recalculatedExercises = recalculateProgressionFromLogs(
      workout.exercises,
      remainingWorkoutLogs
    );

    updateTemplateWorkoutExercises(workout.id, () => recalculatedExercises);
    saveUpdatedWorkout({
      ...updatedWorkout,
      exercises: recalculatedExercises,
    });
  }

  function applySuggestion(exerciseIndex) {
    updateWorkoutExercises((exercises) =>
      exercises.map((plannedExercise, index) =>
        index === exerciseIndex
          ? applyProgressionSuggestion(plannedExercise)
          : plannedExercise
      )
    );
  }

  function keepSameTarget(exerciseIndex) {
    updateWorkoutExercises((exercises) =>
      exercises.map((plannedExercise, index) =>
        index === exerciseIndex
          ? dismissProgressionSuggestion(plannedExercise)
          : plannedExercise
      )
    );
  }

  if (!workout) {
    return (
      <main className="min-h-screen bg-background px-6 py-10 text-foreground">
        <div className="mx-auto max-w-4xl">
          <h1 className="text-4xl font-bold">No workout selected</h1>
          <p className="mt-3 text-muted">
            Go back to your schedule and choose a workout.
          </p>

          <div className="mt-6 flex flex-wrap gap-3">
            <Link
              href="/schedule"
              className="rounded-xl bg-primary px-6 py-3 font-semibold text-white transition hover:bg-primary-hover"
            >
              Go to schedule
            </Link>

            <Link
              href="/dashboard"
              className="rounded-xl border border-border bg-card px-6 py-3 font-semibold text-foreground transition hover:border-primary"
            >
              Go to dashboard
            </Link>
          </div>
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

        {workout.status === "completed" && (
          <section className="mt-8 rounded-2xl border border-border bg-card p-6 shadow-sm">
            <h2 className="text-2xl font-semibold">What next?</h2>
            <p className="mt-2 text-sm text-muted">
              Review your progress, check the rest of your week, or compare
              this session against the plan.
            </p>

            <div className="mt-5 flex flex-wrap gap-3">
              <Link
                href="/dashboard"
                className="rounded-xl bg-primary px-5 py-3 text-sm font-semibold text-white transition hover:bg-primary-hover"
              >
                View dashboard
              </Link>

              <Link
                href="/schedule"
                className="rounded-xl border border-border bg-background px-5 py-3 text-sm font-semibold text-foreground transition hover:border-primary"
              >
                Back to schedule
              </Link>

              <Link
                href="/plan"
                className="rounded-xl border border-border bg-background px-5 py-3 text-sm font-semibold text-foreground transition hover:border-primary"
              >
                View plan
              </Link>
            </div>
          </section>
        )}

        {workout.exercises.some(
          (plannedExercise) => plannedExercise.progression?.pendingSuggestion
        ) && (
          <section className="mt-8 rounded-2xl border border-border bg-card p-6 shadow-sm">
            <h2 className="text-2xl font-semibold">
              Suggested updates for this workout
            </h2>
            <div className="mt-4 grid gap-4">
              {workout.exercises.map((plannedExercise, index) => {
                const suggestion =
                  plannedExercise.progression?.pendingSuggestion;
                const exercise = getExerciseById(plannedExercise.exerciseId);

                if (!suggestion) return null;

                return (
                  <article
                    key={`${plannedExercise.exerciseId}-${index}-suggestion`}
                    className="rounded-xl border border-border bg-background p-4"
                  >
                    <div className="flex flex-col justify-between gap-4 lg:flex-row lg:items-start">
                      <div>
                        <p className="font-semibold">
                          {exercise ? exercise.name : plannedExercise.exerciseId}
                        </p>
                        <p className="mt-2 text-sm text-muted">
                          Current: {getExerciseTargetText(plannedExercise)}
                        </p>
                        <p className="mt-1 text-sm text-muted">
                          Suggested: {suggestion.to}
                        </p>
                        <p className="mt-2 text-sm text-muted">
                          {suggestion.reason}
                        </p>
                      </div>

                      <div className="flex gap-2">
                        <button
                          type="button"
                          onClick={() => applySuggestion(index)}
                          className="rounded-lg bg-primary px-4 py-2 text-sm font-semibold text-white transition hover:bg-primary-hover"
                        >
                          Apply
                        </button>
                        <button
                          type="button"
                          onClick={() => keepSameTarget(index)}
                          className="rounded-lg border border-border bg-card px-4 py-2 text-sm font-semibold text-foreground transition hover:border-primary"
                        >
                          Keep same
                        </button>
                      </div>
                    </div>
                  </article>
                );
              })}
            </div>
          </section>
        )}

        <section className="mt-8 grid gap-5">
          {workout.exercises.map((plannedExercise, index) => {
            const exercise = getExerciseById(plannedExercise.exerciseId);
            const isDetailsOpen = openDetailsId === `${plannedExercise.exerciseId}-${index}`;
            const isAlternatesOpen =
              openAlternatesId === `${plannedExercise.exerciseId}-${index}`;

            const validAlternates = exercise
              ? getTopAlternateExercises(exercise, profile, 3)
              : [];

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
                      {getExerciseTargetText(plannedExercise)}
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

                  <div className="flex flex-col gap-2 sm:items-end">
                    <button
                      type="button"
                      onClick={() =>
                        toggleExerciseCompleted(plannedExercise.exerciseId)
                      }
                      className={`rounded-xl border px-4 py-2 text-sm font-semibold transition ${
                        exerciseCompletions[plannedExercise.exerciseId]
                          ? "border-green-200 bg-green-100 text-green-700"
                          : "border-border bg-background text-foreground hover:border-primary"
                      }`}
                    >
                      {exerciseCompletions[plannedExercise.exerciseId]
                        ? "Completed"
                        : "Mark exercise done"}
                    </button>

                    {exercise && (
                      <Link
                        href={`/exercises/${exercise.id}`}
                        className="rounded-xl border border-border bg-background px-4 py-2 text-center text-sm font-semibold text-foreground transition hover:border-primary"
                      >
                        View full guide
                      </Link>
                    )}
                  </div>
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
              onClick={completeWorkout}
              disabled={!isTodayOrPast(workout.date)}
              className="rounded-xl bg-primary px-6 py-3 font-semibold text-white transition hover:bg-primary-hover disabled:cursor-not-allowed disabled:bg-muted"
            >
              {isTodayOrPast(workout.date)
                ? "Complete workout"
                : "Not available yet"}
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
