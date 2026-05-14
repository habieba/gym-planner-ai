import { exerciseLibrary } from "@/data/exerciseLibrary";

export function getExerciseById(exerciseId) {
  return exerciseLibrary.find((exercise) => exercise.id === exerciseId);
}

export function getExerciseName(exerciseId) {
  const exercise = getExerciseById(exerciseId);
  return exercise ? exercise.name : exerciseId;
}

const commonExerciseIds = new Set([
  "squat",
  "goblet-squat",
  "leg-press",
  "romanian-deadlift",
  "hip-thrust",
  "glute-bridge",
  "walking-lunge",
  "bulgarian-split-squat",
  "bench-press",
  "dumbbell-bench-press",
  "push-up",
  "lat-pulldown",
  "seated-row",
  "dumbbell-row",
  "shoulder-press",
  "lateral-raise",
  "bicep-curl",
  "tricep-pushdown",
  "plank",
  "side-plank",
  "cable-crunch",
]);

function getDifficultyScore(difficulty) {
  const scores = {
    Beginner: 1,
    Intermediate: 2,
    Advanced: 3,
  };

  return scores[difficulty] || 2;
}

function getUserLevelScore(experienceLevel) {
  const scores = {
    Beginner: 1,
    "Some experience": 1.5,
    Intermediate: 2,
    Advanced: 3,
  };

  return scores[experienceLevel] || 1.5;
}

function countOverlap(listA = [], listB = []) {
  return listA.filter((item) => listB.includes(item)).length;
}

function scoreAlternative(currentExercise, alternateExercise, profile = {}) {
  let score = 0;

  const focusAreas = profile.focusAreas || [];
  const userLevel = getUserLevelScore(profile.experienceLevel);
  const alternateLevel = getDifficultyScore(alternateExercise.difficulty);

  const primaryOverlap = countOverlap(
    currentExercise.primaryMuscles,
    alternateExercise.primaryMuscles
  );

  const secondaryOverlap = countOverlap(
    currentExercise.primaryMuscles,
    alternateExercise.secondaryMuscles
  );

  score += primaryOverlap * 6;
  score += secondaryOverlap * 2;

  const focusOverlap = countOverlap(focusAreas, alternateExercise.primaryMuscles);
  score += focusOverlap * 4;

  if (commonExerciseIds.has(alternateExercise.id)) {
    score += 3;
  }

  if (alternateLevel <= userLevel) {
    score += 2;
  }

  if (userLevel <= 1.5 && alternateExercise.difficulty === "Beginner") {
    score += 3;
  }

  if (userLevel <= 1.5 && alternateExercise.difficulty === "Advanced") {
    score -= 5;
  }

  const equipment = alternateExercise.equipment || [];
  const trainingLocation = profile.trainingLocation || "";

  if (trainingLocation.includes("At home")) {
    if (
      equipment.includes("Bodyweight") ||
      equipment.includes("Dumbbells") ||
      equipment.includes("Resistance bands")
    ) {
      score += 3;
    }

    if (
      equipment.includes("Machine") ||
      equipment.includes("Cable machine") ||
      equipment.includes("Barbell")
    ) {
      score -= 2;
    }
  }

  if (trainingLocation.includes("Commercial gym")) {
    if (
      equipment.includes("Machine") ||
      equipment.includes("Cable machine") ||
      equipment.includes("Dumbbells") ||
      equipment.includes("Barbell")
    ) {
      score += 2;
    }
  }

  return score;
}

export function getTopAlternateExercises(currentExercise, profile = {}, limit = 3) {
  if (!currentExercise?.alternatives?.length) return [];

  return currentExercise.alternatives
    .map((alternateId) => getExerciseById(alternateId))
    .filter(Boolean)
    .filter((alternate) => alternate.id !== currentExercise.id)
    .map((alternate) => ({
      exercise: alternate,
      score: scoreAlternative(currentExercise, alternate, profile),
    }))
    .sort((a, b) => b.score - a.score)
    .slice(0, limit)
    .map((item) => item.exercise);
}