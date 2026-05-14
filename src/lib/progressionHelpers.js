export const DEFAULT_WEIGHT_UNIT = "lb";
export const DEFAULT_REST_SECONDS = 90;
export const DEFAULT_REQUIRED_COMPLETIONS = 2;
export const DEFAULT_WEIGHT_INCREASE = 5;
export const DEFAULT_DURATION_INCREASE = 5;
export const DEFAULT_MAX_REP_CAP = 15;
export const DEFAULT_MAX_WEIGHT_CAP = 200;
export const DEFAULT_MAX_DURATION_CAP_SECONDS = 90;

export function parseRepRange(reps) {
  if (typeof reps !== "string") return {};
  if (reps.toLowerCase().includes("sec")) return {};

  const match = reps.match(/(\d+)\s*-\s*(\d+)/);
  if (!match) return {};

  return {
    repMin: Number(match[1]),
    repMax: Number(match[2]),
  };
}

export function parseDurationRange(reps) {
  if (typeof reps !== "string") return {};
  if (!reps.toLowerCase().includes("sec")) return {};

  const rangeMatch = reps.match(/(\d+)\s*-\s*(\d+)/);
  if (rangeMatch) {
    return {
      durationMin: Number(rangeMatch[1]),
      durationMax: Number(rangeMatch[2]),
    };
  }

  const singleMatch = reps.match(/(\d+)/);
  if (!singleMatch) return {};

  return {
    durationMin: Number(singleMatch[1]),
    durationMax: Number(singleMatch[1]),
  };
}

export function createProgressionState(overrides = {}) {
  return {
    successfulCompletions: 0,
    requiredCompletionsBeforeProgression: DEFAULT_REQUIRED_COMPLETIONS,
    pendingSuggestion: null,
    maxRepCap: DEFAULT_MAX_REP_CAP,
    maxWeightCap: DEFAULT_MAX_WEIGHT_CAP,
    maxDurationCapSeconds: DEFAULT_MAX_DURATION_CAP_SECONDS,
    ...overrides,
  };
}

export function createPlannedExercise(exerciseId, sets, reps, options = {}) {
  const targetWeight = options.targetWeight ?? null;

  return {
    exerciseId,
    sets,
    reps,
    ...parseRepRange(reps),
    ...parseDurationRange(reps),
    targetWeight,
    weightUnit: targetWeight === null ? null : options.weightUnit || DEFAULT_WEIGHT_UNIT,
    restSeconds: options.restSeconds || DEFAULT_REST_SECONDS,
    progression: createProgressionState(options.progression),
  };
}

export function normalizePlannedExercise(exercise) {
  const parsedTargets = {
    ...parseRepRange(exercise.reps),
    ...parseDurationRange(exercise.reps),
  };
  const targetWeight = exercise.targetWeight ?? null;

  return {
    ...exercise,
    ...parsedTargets,
    targetWeight,
    weightUnit: targetWeight === null ? null : exercise.weightUnit || DEFAULT_WEIGHT_UNIT,
    restSeconds: exercise.restSeconds || DEFAULT_REST_SECONDS,
    progression: createProgressionState(exercise.progression),
  };
}

function getRequiredCompletions(exercise) {
  return (
    exercise.progression?.requiredCompletionsBeforeProgression ||
    DEFAULT_REQUIRED_COMPLETIONS
  );
}

function getCaps(exercise) {
  const progression = createProgressionState(exercise.progression);

  return {
    maxRepCap: progression.maxRepCap,
    maxWeightCap: progression.maxWeightCap,
    maxDurationCapSeconds: progression.maxDurationCapSeconds,
  };
}

export function getExerciseTargetText(exercise) {
  const weightText =
    exercise.targetWeight !== null && exercise.targetWeight !== undefined
      ? ` at ${exercise.targetWeight} ${exercise.weightUnit || DEFAULT_WEIGHT_UNIT}`
      : "";

  return `${exercise.sets} sets x ${exercise.reps}${weightText}`;
}

export function createProgressionSuggestion(exercise) {
  const { maxRepCap, maxWeightCap, maxDurationCapSeconds } = getCaps(exercise);

  if (exercise.repMin && exercise.repMax && exercise.repMax < maxRepCap) {
    const nextRepMin = Math.min(exercise.repMin + 2, maxRepCap);
    const nextRepMax = Math.min(exercise.repMax + 2, maxRepCap);

    return {
      type: "increase_reps",
      from: `${exercise.repMin}-${exercise.repMax}`,
      to: `${nextRepMin}-${nextRepMax}`,
      reason: "You completed this exercise enough times. Try a slightly higher rep target.",
    };
  }

  if (
    exercise.targetWeight !== null &&
    exercise.targetWeight !== undefined &&
    exercise.targetWeight < maxWeightCap
  ) {
    return {
      type: "increase_weight",
      from: exercise.targetWeight,
      to: Math.min(exercise.targetWeight + DEFAULT_WEIGHT_INCREASE, maxWeightCap),
      reason: "You completed this exercise enough times. Try a small weight increase.",
    };
  }

  if (
    exercise.durationMin &&
    exercise.durationMax &&
    exercise.durationMax < maxDurationCapSeconds
  ) {
    const nextDurationMin = Math.min(
      exercise.durationMin + DEFAULT_DURATION_INCREASE,
      maxDurationCapSeconds
    );
    const nextDurationMax = Math.min(
      exercise.durationMax + DEFAULT_DURATION_INCREASE,
      maxDurationCapSeconds
    );

    return {
      type: "increase_duration",
      from: `${exercise.durationMin}-${exercise.durationMax} sec`,
      to: `${nextDurationMin}-${nextDurationMax} sec`,
      reason: "You completed this exercise enough times. Try a slightly longer hold.",
    };
  }

  return null;
}

export function updateExerciseProgression(exercise, wasCompleted) {
  const progression = createProgressionState(exercise.progression);
  const successfulCompletions = wasCompleted
    ? progression.successfulCompletions + 1
    : 0;
  const requiredCompletions = getRequiredCompletions(exercise);
  const pendingSuggestion =
    successfulCompletions >= requiredCompletions
      ? createProgressionSuggestion(exercise)
      : null;

  return {
    ...exercise,
    progression: {
      ...progression,
      successfulCompletions,
      pendingSuggestion,
    },
  };
}

export function applyProgressionSuggestion(exercise) {
  const suggestion = exercise.progression?.pendingSuggestion;
  const progression = createProgressionState(exercise.progression);

  if (!suggestion) return exercise;

  const updatedExercise = {
    ...exercise,
    progression: {
      ...progression,
      successfulCompletions: 0,
      pendingSuggestion: null,
    },
  };

  if (suggestion.type === "increase_weight") {
    return {
      ...updatedExercise,
      targetWeight: suggestion.to,
    };
  }

  if (suggestion.type === "increase_reps") {
    const [repMin, repMax] = suggestion.to.split("-").map(Number);

    return {
      ...updatedExercise,
      reps: suggestion.to,
      repMin,
      repMax,
    };
  }

  if (suggestion.type === "increase_duration") {
    const [durationMin, durationMax] = suggestion.to
      .replace(" sec", "")
      .split("-")
      .map(Number);

    return {
      ...updatedExercise,
      reps: suggestion.to,
      durationMin,
      durationMax,
    };
  }

  return updatedExercise;
}

export function dismissProgressionSuggestion(exercise) {
  return {
    ...exercise,
    progression: {
      ...createProgressionState(exercise.progression),
      successfulCompletions: 0,
      pendingSuggestion: null,
    },
  };
}

export function recalculateProgressionFromLogs(exercises, logs) {
  return logs.reduce(
    (currentExercises, log) =>
      currentExercises.map((exercise) => {
        const completion = log.exerciseCompletions?.find(
          (item) => item.exerciseId === exercise.exerciseId
        );

        return updateExerciseProgression(exercise, Boolean(completion?.completed));
      }),
    exercises.map((exercise) =>
      normalizePlannedExercise({
        ...exercise,
        progression: createProgressionState({
          ...exercise.progression,
          successfulCompletions: 0,
          pendingSuggestion: null,
        }),
      })
    )
  );
}
