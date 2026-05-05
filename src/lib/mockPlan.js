export function chooseWorkoutLength(preference) {
    if (!preference) return "45 minutes";
  
    if (preference.includes("30")) return "30 minutes";
    if (preference.includes("45")) return "45 minutes";
    if (preference.includes("60")) return "60 minutes";
    if (preference.includes("75")) return "75 minutes";
  
    return "45-60 minutes";
  }
  
  function makeExercise(exerciseId, sets, reps) {
    return {
      exerciseId,
      sets,
      reps,
    };
  }
  
  export function buildMockPlan(profile = {}) {
    const daysPerWeek = Number(profile.daysPerWeek || 3);
    const availableDays = profile.availableDays || [];
    const selectedDays = availableDays.slice(0, daysPerWeek);
    const workoutLength = chooseWorkoutLength(profile.workoutLengthPreference);
  
    const fallbackDays = ["Monday", "Wednesday", "Friday"];
    const finalDays = selectedDays.length > 0 ? selectedDays : fallbackDays;
  
    const goal = profile.primaryGoal || "General fitness";
    const focusAreas = profile.focusAreas || [];
  
    let split = ["Full Body", "Full Body", "Full Body"];
  
    if (daysPerWeek >= 4) {
      split = ["Upper Body", "Lower Body", "Push", "Pull"];
    }
  
    if (focusAreas.includes("Glutes") && daysPerWeek >= 3) {
      split = ["Glutes + Legs", "Upper Body", "Glutes + Core", "Full Body"];
    }
  
    if (goal === "Build strength") {
      split = ["Strength Upper", "Strength Lower", "Accessory + Core", "Full Body"];
    }
  
    const exerciseBank = {
      "Full Body": [
        makeExercise("goblet-squat", 3, "8-10"),
        makeExercise("dumbbell-bench-press", 3, "8-10"),
        makeExercise("lat-pulldown", 3, "10-12"),
        makeExercise("romanian-deadlift", 3, "8-10"),
        makeExercise("plank", 3, "30-45 sec"),
      ],
  
      "Upper Body": [
        makeExercise("bench-press", 3, "6-8"),
        makeExercise("lat-pulldown", 3, "8-10"),
        makeExercise("seated-row", 3, "10-12"),
        makeExercise("shoulder-press", 3, "8-10"),
        makeExercise("bicep-curl", 2, "10-12"),
      ],
  
      "Lower Body": [
        makeExercise("squat", 3, "6-8"),
        makeExercise("romanian-deadlift", 3, "8-10"),
        makeExercise("leg-press", 3, "10-12"),
        makeExercise("hamstring-curl", 3, "10-12"),
        makeExercise("calf-raise", 2, "12-15"),
      ],
  
      Push: [
        makeExercise("dumbbell-bench-press", 3, "8-10"),
        makeExercise("shoulder-press", 3, "8-10"),
        makeExercise("bench-press", 3, "10-12"),
        makeExercise("lateral-raise", 2, "12-15"),
        makeExercise("tricep-pushdown", 2, "10-12"),
      ],
  
      Pull: [
        makeExercise("lat-pulldown", 3, "8-10"),
        makeExercise("seated-row", 3, "10-12"),
        makeExercise("face-pull", 2, "12-15"),
        makeExercise("rear-delt-fly", 2, "12-15"),
        makeExercise("bicep-curl", 2, "10-12"),
      ],
  
      "Glutes + Legs": [
        makeExercise("hip-thrust", 4, "8-10"),
        makeExercise("leg-press", 3, "10-12"),
        makeExercise("romanian-deadlift", 3, "8-10"),
        makeExercise("walking-lunge", 2, "10 each leg"),
        makeExercise("cable-kickback", 2, "12-15"),
      ],
  
      "Glutes + Core": [
        makeExercise("hip-thrust", 3, "8-10"),
        makeExercise("bulgarian-split-squat", 3, "8 each leg"),
        makeExercise("cable-kickback", 3, "12-15"),
        makeExercise("ab-crunch-machine", 3, "10-12"),
        makeExercise("side-plank", 2, "30 sec each side"),
      ],
  
      "Strength Upper": [
        makeExercise("bench-press", 4, "4-6"),
        makeExercise("seated-row", 4, "5-6"),
        makeExercise("shoulder-press", 3, "5-6"),
        makeExercise("lat-pulldown", 3, "8-10"),
        makeExercise("farmer-carry", 3, "30 sec"),
      ],
  
      "Strength Lower": [
        makeExercise("squat", 4, "4-6"),
        makeExercise("romanian-deadlift", 3, "6-8"),
        makeExercise("leg-press", 3, "8-10"),
        makeExercise("hamstring-curl", 3, "8-10"),
        makeExercise("calf-raise", 3, "10-12"),
      ],
  
      "Accessory + Core": [
        makeExercise("dumbbell-bench-press", 3, "8-10"),
        makeExercise("seated-row", 3, "8-10"),
        makeExercise("lateral-raise", 3, "12-15"),
        makeExercise("cable-crunch", 3, "10-12"),
        makeExercise("plank", 3, "45 sec"),
      ],
    };
  
    return finalDays.map((day, index) => {
      const workoutType = split[index % split.length];
  
      return {
        id: `workout-${index + 1}`,
        day,
        title: workoutType,
        duration: workoutLength,
        exercises: exerciseBank[workoutType] || exerciseBank["Full Body"],
      };
    });
  }