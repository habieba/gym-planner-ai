import {
  buildWeekSchedule,
  formatISODate,
  getCompletionRecords,
  getWeeklyPlanTemplate,
  getWorkoutRecord,
  isTodayOrPast,
  removeWorkoutRecord,
  saveWorkoutRecord,
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

function addDays(date, days) {
  const copy = new Date(date);
  copy.setDate(copy.getDate() + days);
  return copy;
}

function getWeekDates(weekStartDate) {
  return Array.from({ length: 7 }, (_, index) => {
    const current = addDays(weekStartDate, index);

    return {
      date: formatISODate(current),
      fullDay: new Intl.DateTimeFormat("en-US", {
        weekday: "long",
      }).format(current),
    };
  });
}

function nextDateForDay(dayName, fromDate = new Date()) {
  const dayIndexMap = {
    Sunday: 0,
    Monday: 1,
    Tuesday: 2,
    Wednesday: 3,
    Thursday: 4,
    Friday: 5,
    Saturday: 6,
  };
  const targetIndex = dayIndexMap[dayName];
  const copy = new Date(fromDate);
  const diff = targetIndex - copy.getDay();
  copy.setDate(copy.getDate() + (diff < 0 ? diff + 7 : diff));
  copy.setHours(0, 0, 0, 0);
  return copy;
}

globalThis.window = {};
globalThis.localStorage = createLocalStorage();

const profile = {
  version: 1,
  daysPerWeek: 3,
  availableDays: ["Monday", "Wednesday", "Saturday"],
  preferredTime: "18:00",
  workoutLengthPreference: "Standard: 45 minutes",
};

const template = getWeeklyPlanTemplate(profile);
const monday = nextDateForDay("Monday");
const nextMonday = addDays(monday, 7);
const thisWeekSchedule = buildWeekSchedule(
  template,
  getWeekDates(monday),
  getCompletionRecords()
);
const nextWeekSchedule = buildWeekSchedule(
  template,
  getWeekDates(nextMonday),
  getCompletionRecords()
);

assert(
  thisWeekSchedule.map((workout) => workout.day).join(",") ===
    "Monday,Wednesday,Saturday",
  "Monday, Wednesday, and Saturday should appear in the selected week."
);
assert(
  nextWeekSchedule.map((workout) => workout.day).join(",") ===
    "Monday,Wednesday,Saturday",
  "Monday, Wednesday, and Saturday should appear again next week."
);

const mondayWorkout = thisWeekSchedule[0];
const nextMondayWorkout = nextWeekSchedule[0];

saveWorkoutRecord(mondayWorkout, {
  status: "completed",
  completedAt: new Date().toISOString(),
});

const recordsAfterCompletion = getCompletionRecords();

assert(
  getWorkoutRecord(recordsAfterCompletion, mondayWorkout)?.status ===
    "completed",
  "Completing this Monday should mark this Monday completed."
);
assert(
  getWorkoutRecord(recordsAfterCompletion, nextMondayWorkout) === null,
  "Completing this Monday should not mark next Monday completed."
);

const today = new Date();
const tomorrow = addDays(today, 1);
const yesterday = addDays(today, -1);

assert(isTodayOrPast(formatISODate(today)), "Today should be completable.");
assert(
  isTodayOrPast(formatISODate(yesterday)),
  "Past workouts should be completable."
);
assert(
  !isTodayOrPast(formatISODate(tomorrow)),
  "Future workouts should not be completable."
);

const persistedRecords = getCompletionRecords();
assert(
  getWorkoutRecord(persistedRecords, mondayWorkout)?.status === "completed",
  "Refreshing should preserve completed records by date."
);

removeWorkoutRecord(mondayWorkout);

assert(
  getWorkoutRecord(getCompletionRecords(), mondayWorkout) === null,
  "Past/today workout records should be removable."
);

console.log("This week:", thisWeekSchedule.map((workout) => workout.day).join(", "));
console.log("Next week:", nextWeekSchedule.map((workout) => workout.day).join(", "));
console.log("Completed date:", mondayWorkout.date);
console.log("Next matching date still open:", nextMondayWorkout.date);
console.log("Recurring schedule validation passed.");
