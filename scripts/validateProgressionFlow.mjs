import {
  applyProgressionSuggestion,
  createPlannedExercise,
  dismissProgressionSuggestion,
  recalculateProgressionFromLogs,
  updateExerciseProgression,
} from "../src/lib/progressionHelpers.js";
import {
  getWeeklyPlanTemplate,
  updateTemplateWorkoutExercises,
  WEEKLY_TEMPLATE_KEY,
} from "../src/lib/scheduleStorage.js";

function createLocalStorage() {
  const store = new Map();

  return {
    getItem(key) {
      return store.has(key) ? store.get(key) : null;
    },
    setItem(key, value) {
      store.set(key, String(value));
    },
    removeItem(key) {
      store.delete(key);
    },
  };
}

function assert(condition, message) {
  if (!condition) {
    throw new Error(message);
  }
}

globalThis.window = {};
globalThis.localStorage = createLocalStorage();

let exercise = createPlannedExercise("goblet-squat", 3, "8-10");

exercise = updateExerciseProgression(exercise, true);

assert(
  exercise.progression.successfulCompletions === 1,
  "One checked completion should increment successfulCompletions to 1."
);
assert(
  exercise.progression.pendingSuggestion === null,
  "One checked completion should not create a suggestion."
);

exercise = updateExerciseProgression(exercise, true);

assert(
  exercise.progression.pendingSuggestion?.type === "increase_reps",
  "Two checked completions should create a rep progression suggestion."
);

const progressedExercise = applyProgressionSuggestion(exercise);

assert(
  progressedExercise.reps === "10-12",
  "Applying a rep suggestion should update reps."
);
assert(
  progressedExercise.progression.pendingSuggestion === null &&
    progressedExercise.progression.successfulCompletions === 0,
  "Applying a suggestion should clear it and reset successfulCompletions."
);

let uncheckedExercise = createPlannedExercise("lat-pulldown", 3, "10-12");
uncheckedExercise = updateExerciseProgression(uncheckedExercise, true);
uncheckedExercise = updateExerciseProgression(uncheckedExercise, false);

assert(
  uncheckedExercise.progression.successfulCompletions === 0,
  "Unchecked exercises should reset successfulCompletions."
);

let cappedRepExercise = createPlannedExercise("goblet-squat", 3, "14-15", {
  targetWeight: 25,
});
cappedRepExercise = updateExerciseProgression(cappedRepExercise, true);
cappedRepExercise = updateExerciseProgression(cappedRepExercise, true);

assert(
  cappedRepExercise.progression.pendingSuggestion?.type === "increase_weight",
  "If reps are capped, weighted exercises should progress by weight."
);
assert(
  cappedRepExercise.progression.pendingSuggestion?.to === 30,
  "Weight progression should increase by 5 lb."
);

let cappedWeightExercise = createPlannedExercise("lateral-raise", 2, "14-15", {
  targetWeight: 30,
  progression: {
    maxWeightCap: 30,
  },
});
cappedWeightExercise = updateExerciseProgression(cappedWeightExercise, true);
cappedWeightExercise = updateExerciseProgression(cappedWeightExercise, true);

assert(
  cappedWeightExercise.progression.pendingSuggestion === null,
  "No suggestion should be created after rep and weight caps are reached."
);

let durationExercise = createPlannedExercise("plank", 3, "30-45 sec");
durationExercise = updateExerciseProgression(durationExercise, true);
durationExercise = updateExerciseProgression(durationExercise, true);

assert(
  durationExercise.progression.pendingSuggestion?.type === "increase_duration",
  "Time-based exercises should suggest duration progression."
);

const dismissedExercise = dismissProgressionSuggestion(cappedRepExercise);

assert(
  dismissedExercise.targetWeight === 25 &&
    dismissedExercise.progression.pendingSuggestion === null,
  "Keeping the same target should clear the suggestion without changing weight."
);

const profile = {
  version: 1,
  daysPerWeek: 1,
  availableDays: ["Monday"],
  preferredTime: "18:00",
  workoutLengthPreference: "Standard: 45 minutes",
};
const template = getWeeklyPlanTemplate(profile);
const workoutId = template[0].id;

updateTemplateWorkoutExercises(workoutId, (exercises) =>
  exercises.map((plannedExercise, index) =>
    index === 0 ? progressedExercise : plannedExercise
  )
);

const savedTemplate = JSON.parse(localStorage.getItem(WEEKLY_TEMPLATE_KEY));

assert(
  savedTemplate[0].exercises[0].reps === "10-12",
  "Applying a suggestion should persist to the weekly template."
);

const recalculatedAfterUndo = recalculateProgressionFromLogs(
  [
    createPlannedExercise("goblet-squat", 3, "8-10"),
    createPlannedExercise("plank", 3, "30-45 sec"),
  ],
  [
    {
      date: "2026-05-01",
      exerciseCompletions: [
        { exerciseId: "goblet-squat", completed: true },
        { exerciseId: "plank", completed: false },
      ],
    },
  ]
);

assert(
  recalculatedAfterUndo[0].progression.successfulCompletions === 1,
  "Recalculation should preserve remaining checked completion history."
);
assert(
  recalculatedAfterUndo[1].progression.successfulCompletions === 0,
  "Recalculation should reset unchecked exercises."
);

console.log("Rep progression suggestion:", exercise.progression.pendingSuggestion);
console.log("Applied reps:", progressedExercise.reps);
console.log("Weight suggestion:", cappedRepExercise.progression.pendingSuggestion);
console.log("Duration suggestion:", durationExercise.progression.pendingSuggestion);
console.log("Progression flow validation passed.");
