import { exerciseLibrary } from "@/data/exerciseLibrary";

export function getExerciseById(exerciseId) {
  return exerciseLibrary.find((exercise) => exercise.id === exerciseId);
}

export function getExerciseName(exerciseId) {
  const exercise = getExerciseById(exerciseId);
  return exercise ? exercise.name : exerciseId;
}