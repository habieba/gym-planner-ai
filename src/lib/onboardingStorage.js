const STORAGE_KEY = "gym_onboarding";
const SCHEDULE_STORAGE_KEY = "gym_scheduled_workouts";
const ACTIVE_WORKOUT_KEY = "gym_active_workout";
const WEEKLY_TEMPLATE_KEY = "gym_weekly_plan_template";
const COMPLETION_RECORDS_KEY = "gym_workout_completion_records";
const WEEK_DAYS = [
  "Monday",
  "Tuesday",
  "Wednesday",
  "Thursday",
  "Friday",
  "Saturday",
  "Sunday",
];

export function normalizeDaysPerWeek(value) {
  return Math.min(Math.max(Number(value || 3), 1), 7);
}

export function normalizeScheduleFields(data) {
  const daysPerWeek = normalizeDaysPerWeek(data.daysPerWeek);
  const availableDays = Array.isArray(data.availableDays)
    ? data.availableDays.filter(
        (day, index, days) =>
          WEEK_DAYS.includes(day) && days.indexOf(day) === index
      )
    : [];

  return {
    ...data,
    daysPerWeek,
    availableDays: availableDays.slice(0, daysPerWeek),
  };
}

function hasScheduleFields(data) {
  return (
    Object.hasOwn(data, "daysPerWeek") || Object.hasOwn(data, "availableDays")
  );
}

export function getOnboardingData() {
  if (typeof window === "undefined") return {};

  const saved = localStorage.getItem(STORAGE_KEY);

  if (!saved) return {};

  try {
    return normalizeScheduleFields(JSON.parse(saved));
  } catch {
    return {};
  }
}

export function saveOnboardingData(newData) {
  if (typeof window === "undefined") return;

  const currentData = getOnboardingData();
  const currentVersion = currentData.version || 0;

  const mergedData = {
    ...currentData,
    ...newData,
    version: currentVersion + 1,
    updatedAt: new Date().toISOString(),
  };
  const updatedData = hasScheduleFields(newData)
    ? normalizeScheduleFields(mergedData)
    : mergedData;

  if (
    hasScheduleFields(newData) &&
    updatedData.availableDays.length !== updatedData.daysPerWeek
  ) {
    return null;
  }

  localStorage.setItem(STORAGE_KEY, JSON.stringify(updatedData));
  localStorage.removeItem(SCHEDULE_STORAGE_KEY);
  localStorage.removeItem(ACTIVE_WORKOUT_KEY);
  localStorage.removeItem(WEEKLY_TEMPLATE_KEY);
  localStorage.removeItem(COMPLETION_RECORDS_KEY);

  return updatedData;
}
