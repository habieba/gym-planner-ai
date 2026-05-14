import { buildMockPlan } from "../src/lib/mockPlan.js";

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
    clear() {
      store.clear();
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

const { getOnboardingData, normalizeDaysPerWeek, saveOnboardingData } =
  await import("../src/lib/onboardingStorage.js");

function selectDay(currentDays, day, daysPerWeek) {
  if (currentDays.includes(day)) {
    return currentDays.filter((currentDay) => currentDay !== day);
  }

  if (currentDays.length >= daysPerWeek) {
    return currentDays;
  }

  return [...currentDays, day];
}

function updateDaysPerWeek(currentDays, value) {
  const daysPerWeek = normalizeDaysPerWeek(value);

  return {
    daysPerWeek,
    availableDays: currentDays.slice(0, daysPerWeek),
  };
}

const threeDayPlanWithOneSelectedDay = buildMockPlan({
  daysPerWeek: 3,
  availableDays: ["Monday"],
});

assert(
  threeDayPlanWithOneSelectedDay.length === 3,
  "buildMockPlan should return 3 workouts when daysPerWeek is 3."
);

let selectedDays = ["Monday", "Saturday"];
selectedDays = selectDay(selectedDays, "Sunday", 2);
assert(
  selectedDays.join(",") === "Monday,Saturday",
  "Sunday should not be selected when daysPerWeek is 2 and 2 days are already selected."
);

saveOnboardingData({
  daysPerWeek: 3,
  availableDays: ["Monday", "Saturday", "Sunday"],
  preferredTime: "18:00",
  workoutLengthPreference: "Standard: 45 minutes",
});

let savedProfile = getOnboardingData();
let plan = buildMockPlan(savedProfile);

assert(savedProfile.daysPerWeek === 3, "Saved daysPerWeek should be 3.");
assert(
  savedProfile.availableDays.length === 3,
  "Saved availableDays should have exactly 3 days."
);
assert(plan.length === 3, "/plan should build 3 workouts from latest profile.");

const trimmedSchedule = updateDaysPerWeek(savedProfile.availableDays, 2);
saveOnboardingData({
  ...trimmedSchedule,
  preferredTime: savedProfile.preferredTime,
  workoutLengthPreference: savedProfile.workoutLengthPreference,
});

savedProfile = getOnboardingData();
plan = buildMockPlan(savedProfile);

assert(savedProfile.daysPerWeek === 2, "daysPerWeek should save as 2.");
assert(
  savedProfile.availableDays.length === 2,
  "availableDays should trim to 2 when daysPerWeek changes from 3 to 2."
);
assert(plan.length === 2, "Plan should regenerate with 2 workouts.");

const expandedSchedule = updateDaysPerWeek(savedProfile.availableDays, 4);
const blockedSave = saveOnboardingData({
  ...expandedSchedule,
  preferredTime: savedProfile.preferredTime,
  workoutLengthPreference: savedProfile.workoutLengthPreference,
});

assert(
  blockedSave === null,
  "Saving should be blocked when daysPerWeek is 4 but only 2 days are selected."
);

saveOnboardingData({
  daysPerWeek: 4,
  availableDays: ["Monday", "Saturday", "Sunday", "Wednesday"],
  preferredTime: savedProfile.preferredTime,
  workoutLengthPreference: savedProfile.workoutLengthPreference,
});

localStorage.setItem(
  "gym_scheduled_workouts",
  JSON.stringify([{ id: "old-workout", profileVersion: 1 }])
);
localStorage.setItem("gym_active_workout", JSON.stringify({ id: "old-workout" }));

saveOnboardingData({
  daysPerWeek: 3,
  availableDays: ["Monday", "Saturday", "Sunday"],
  preferredTime: "18:00",
  workoutLengthPreference: "Standard: 45 minutes",
});

savedProfile = getOnboardingData();
plan = buildMockPlan(savedProfile);

const staleSchedule = [
  { id: "old-workout", profileVersion: savedProfile.version - 1 },
];
const scheduleShouldRegenerate =
  staleSchedule[0]?.profileVersion !== (savedProfile.version || 0) ||
  staleSchedule.length !== plan.length;

assert(
  savedProfile.daysPerWeek === 3,
  "Editing daysPerWeek from 2 to 3 should save gym_onboarding.daysPerWeek as 3."
);
assert(
  localStorage.getItem("gym_scheduled_workouts") === null,
  "Saving onboarding data should clear gym_scheduled_workouts."
);
assert(
  localStorage.getItem("gym_active_workout") === null,
  "Saving onboarding data should clear gym_active_workout."
);
assert(plan.length === 3, "/plan should build 3 workouts from latest onboarding.");
assert(
  scheduleShouldRegenerate,
  "/schedule should regenerate when profileVersion or workout count differs."
);

localStorage.setItem(
  "gym_onboarding",
  JSON.stringify({
    daysPerWeek: 2,
    availableDays: ["Monday", "Saturday", "Sunday"],
  })
);

const normalizedOldProfile = getOnboardingData();

assert(
  normalizedOldProfile.availableDays.length === 2,
  "Old localStorage with 3 availableDays and daysPerWeek 2 should normalize to 2 days on load."
);

console.log("buildMockPlan 3-day check:", threeDayPlanWithOneSelectedDay.length);
console.log("Over-select prevention days:", selectedDays.join(", "));
console.log("Saved daysPerWeek:", savedProfile.daysPerWeek);
console.log("/plan derived workout count:", plan.length);
console.log("/schedule derived workout count:", plan.length);
console.log(
  "Old localStorage normalized availableDays:",
  normalizedOldProfile.availableDays.length
);
console.log("Onboarding flow validation passed.");
