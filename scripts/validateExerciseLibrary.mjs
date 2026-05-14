import { exerciseLibrary } from "../src/data/exerciseLibrary.js";
import { buildMockPlan } from "../src/lib/mockPlan.js";

const ids = new Set();
const duplicateIds = [];
const missingAlternativeRefs = [];
const longAlternativeLists = [];
const missingMockPlanRefs = [];

for (const exercise of exerciseLibrary) {
  if (ids.has(exercise.id)) {
    duplicateIds.push(exercise.id);
  }

  ids.add(exercise.id);
}

for (const exercise of exerciseLibrary) {
  if ((exercise.alternatives || []).length > 10) {
    longAlternativeLists.push({
      id: exercise.id,
      count: exercise.alternatives.length,
    });
  }

  for (const altId of exercise.alternatives || []) {
    if (!ids.has(altId)) {
      missingAlternativeRefs.push({
        exerciseId: exercise.id,
        missingAlternativeId: altId,
      });
    }
  }
}

const mockPlanProfiles = [
  { name: "default", profile: {} },
  {
    name: "four-day split",
    profile: {
      daysPerWeek: 4,
      availableDays: ["Monday", "Tuesday", "Thursday", "Friday"],
    },
  },
  {
    name: "five-day split with three selected days",
    profile: {
      daysPerWeek: 5,
      availableDays: ["Monday", "Wednesday", "Friday"],
    },
  },
  {
    name: "glutes focus",
    profile: {
      daysPerWeek: 4,
      availableDays: ["Monday", "Tuesday", "Thursday", "Friday"],
      focusAreas: ["Glutes"],
    },
  },
  {
    name: "strength goal",
    profile: {
      daysPerWeek: 4,
      availableDays: ["Monday", "Tuesday", "Thursday", "Friday"],
      primaryGoal: "Build strength",
    },
  },
];

for (const { name, profile } of mockPlanProfiles) {
  const plan = buildMockPlan(profile);

  for (const workout of plan) {
    for (const plannedExercise of workout.exercises || []) {
      if (!ids.has(plannedExercise.exerciseId)) {
        missingMockPlanRefs.push({
          profile: name,
          workout: workout.title,
          missingExerciseId: plannedExercise.exerciseId,
        });
      }
    }
  }
}

console.log("Exercise count:", exerciseLibrary.length);
console.log("Duplicate IDs:", duplicateIds);
console.log("Missing alternative references:", missingAlternativeRefs);
console.log("Exercises with long alternative lists:", longAlternativeLists);
console.log("Missing mock plan exercise references:", missingMockPlanRefs);

if (
  duplicateIds.length === 0 &&
  missingAlternativeRefs.length === 0 &&
  missingMockPlanRefs.length === 0
) {
  console.log("Validation passed.");
}
