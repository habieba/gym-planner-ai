import { buildMockPlan } from "./mockPlan.js";
import { normalizePlannedExercise } from "./progressionHelpers.js";

export const ACTIVE_WORKOUT_KEY = "gym_active_workout";
export const LEGACY_SCHEDULE_KEY = "gym_scheduled_workouts";
export const WEEKLY_TEMPLATE_KEY = "gym_weekly_plan_template";
export const COMPLETION_RECORDS_KEY = "gym_workout_completion_records";

export function formatISODate(date) {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, "0");
  const day = String(date.getDate()).padStart(2, "0");

  return `${year}-${month}-${day}`;
}

export function getTodayISODate() {
  return formatISODate(new Date());
}

export function isTodayOrPast(date) {
  return date <= getTodayISODate();
}

export function getDurationInMinutes(duration) {
  if (!duration) return 45;
  if (duration.includes("30")) return 30;
  if (duration.includes("45")) return 45;
  if (duration.includes("60")) return 60;
  if (duration.includes("75")) return 75;
  return 60;
}

export function addMinutesToTime(time, minutesToAdd) {
  const [hours, minutes] = time.split(":").map(Number);

  const date = new Date();
  date.setHours(hours);
  date.setMinutes(minutes + minutesToAdd);

  const endHours = String(date.getHours()).padStart(2, "0");
  const endMinutes = String(date.getMinutes()).padStart(2, "0");

  return `${endHours}:${endMinutes}`;
}

export function readJson(key, fallback) {
  if (typeof window === "undefined") return fallback;

  try {
    return JSON.parse(localStorage.getItem(key) || JSON.stringify(fallback));
  } catch {
    return fallback;
  }
}

export function getCompletionRecords() {
  return readJson(COMPLETION_RECORDS_KEY, {});
}

export function saveCompletionRecords(records) {
  localStorage.setItem(COMPLETION_RECORDS_KEY, JSON.stringify(records));
}

export function getWorkoutRecord(records, workout) {
  return records[workout.date]?.[workout.id] || null;
}

export function saveWorkoutRecord(workout, record) {
  const records = getCompletionRecords();
  const dateRecords = records[workout.date] || {};

  const nextRecords = {
    ...records,
    [workout.date]: {
      ...dateRecords,
      [workout.id]: record,
    },
  };

  saveCompletionRecords(nextRecords);
  return nextRecords;
}

export function removeWorkoutRecord(workout) {
  const records = getCompletionRecords();
  const dateRecords = { ...(records[workout.date] || {}) };

  delete dateRecords[workout.id];

  const nextRecords = {
    ...records,
    [workout.date]: dateRecords,
  };

  if (Object.keys(dateRecords).length === 0) {
    delete nextRecords[workout.date];
  }

  saveCompletionRecords(nextRecords);
  return nextRecords;
}

export function createWeeklyPlanTemplate(profile) {
  const startTime = profile.preferredTime || "18:00";

  return buildMockPlan(profile).map((workout) => {
    const durationMinutes = getDurationInMinutes(workout.duration);

    return {
      ...workout,
      templateId: workout.id,
      startTime,
      endTime: addMinutesToTime(startTime, durationMinutes),
      durationMinutes,
      profileVersion: profile.version || 0,
      exercises: workout.exercises.map((exercise) =>
        normalizePlannedExercise(exercise)
      ),
    };
  });
}

export function getWeeklyPlanTemplate(profile) {
  const expectedTemplate = createWeeklyPlanTemplate(profile);
  const savedTemplate = readJson(WEEKLY_TEMPLATE_KEY, null);
  const profileVersion = profile.version || 0;
  const templateMatchesProfile =
    Array.isArray(savedTemplate) &&
    savedTemplate[0]?.profileVersion === profileVersion &&
    savedTemplate.length === expectedTemplate.length;

  if (templateMatchesProfile) {
    return savedTemplate.map((workout) => ({
      ...workout,
      exercises: workout.exercises.map((exercise) =>
        normalizePlannedExercise(exercise)
      ),
    }));
  }

  localStorage.setItem(WEEKLY_TEMPLATE_KEY, JSON.stringify(expectedTemplate));
  localStorage.removeItem(LEGACY_SCHEDULE_KEY);

  return expectedTemplate;
}

export function saveWeeklyPlanTemplate(template) {
  localStorage.setItem(WEEKLY_TEMPLATE_KEY, JSON.stringify(template));
}

export function updateTemplateWorkoutExercises(workoutId, updater) {
  const template = readJson(WEEKLY_TEMPLATE_KEY, []);
  const nextTemplate = template.map((templateWorkout) => {
    if (templateWorkout.id !== workoutId) return templateWorkout;

    return {
      ...templateWorkout,
      exercises: updater(templateWorkout.exercises || []).map((exercise) =>
        normalizePlannedExercise(exercise)
      ),
    };
  });

  saveWeeklyPlanTemplate(nextTemplate);
  return nextTemplate;
}

export function updateLegacyScheduledWorkout(updatedWorkout) {
  const legacySchedule = readJson(LEGACY_SCHEDULE_KEY, []);

  if (!Array.isArray(legacySchedule) || legacySchedule.length === 0) return;

  const nextSchedule = legacySchedule.map((scheduledWorkout) =>
    scheduledWorkout.id === updatedWorkout.id &&
    scheduledWorkout.date === updatedWorkout.date
      ? updatedWorkout
      : scheduledWorkout
  );

  localStorage.setItem(LEGACY_SCHEDULE_KEY, JSON.stringify(nextSchedule));
}

export function buildWeekSchedule(template, weekDates, records = {}) {
  return weekDates
    .map((dayInfo) => {
      const templateWorkout = template.find(
        (workout) => workout.day === dayInfo.fullDay
      );

      if (!templateWorkout) return null;

      const record = records[dayInfo.date]?.[templateWorkout.id] || null;

      return {
        ...templateWorkout,
        date: dayInfo.date,
        status: record?.status || "scheduled",
        completedAt: record?.completedAt || null,
        notes: record?.notes || "",
        exerciseCompletions: record?.exerciseCompletions || null,
      };
    })
    .filter(Boolean);
}
