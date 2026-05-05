export const exerciseLibrary = [
    {
      id: "goblet-squat",
      name: "Goblet Squat",
      category: "Strength",
      primaryMuscles: ["Quads", "Glutes"],
      secondaryMuscles: ["Core"],
      equipment: ["Dumbbell", "Kettlebell"],
      difficulty: "Beginner",
      instructions: [
        "Hold a dumbbell or kettlebell close to your chest.",
        "Stand with your feet about shoulder-width apart.",
        "Brace your core and lower your hips down into a squat.",
        "Keep your chest up and knees tracking over your toes.",
        "Push through your feet to stand back up."
      ],
      commonMistakes: [
        "Letting the knees collapse inward.",
        "Rounding the back.",
        "Rising onto the toes instead of keeping weight through the feet."
      ],
      tips: [
        "Start light until your squat form feels controlled.",
        "Think about sitting between your hips, not folding forward."
      ],
      alternatives: ["leg-press", "bodyweight-squat"],
      videoUrl: "",
      imageUrl: ""
    },
    {
      id: "dumbbell-bench-press",
      name: "Dumbbell Bench Press",
      category: "Strength",
      primaryMuscles: ["Chest"],
      secondaryMuscles: ["Shoulders", "Triceps"],
      equipment: ["Dumbbells", "Bench"],
      difficulty: "Beginner",
      instructions: [
        "Lie on a flat bench with a dumbbell in each hand.",
        "Start with the dumbbells above your chest and arms extended.",
        "Lower the dumbbells with control until your elbows are slightly below chest level.",
        "Press the dumbbells back up until your arms are extended.",
        "Keep your shoulder blades pulled back against the bench."
      ],
      commonMistakes: [
        "Flaring the elbows too wide.",
        "Bouncing the weights at the bottom.",
        "Letting the shoulders roll forward."
      ],
      tips: [
        "Use a weight you can control for every rep.",
        "Keep your wrists stacked over your elbows."
      ],
      alternatives: ["bench-press", "push-up"],
      videoUrl: "",
      imageUrl: ""
    },
    {
      id: "lat-pulldown",
      name: "Lat Pulldown",
      category: "Strength",
      primaryMuscles: ["Back"],
      secondaryMuscles: ["Biceps"],
      equipment: ["Cable machine"],
      difficulty: "Beginner",
      instructions: [
        "Sit at the pulldown machine and adjust the thigh pad.",
        "Grip the bar slightly wider than shoulder-width.",
        "Pull the bar toward your upper chest.",
        "Drive your elbows down and back.",
        "Slowly return the bar to the starting position."
      ],
      commonMistakes: [
        "Pulling the bar behind the neck.",
        "Using momentum.",
        "Shrugging the shoulders up."
      ],
      tips: [
        "Keep your chest lifted.",
        "Think about pulling with your elbows, not your hands."
      ],
      alternatives: ["assisted-pull-up", "seated-row"],
      videoUrl: "",
      imageUrl: ""
    },
    {
      id: "romanian-deadlift",
      name: "Romanian Deadlift",
      category: "Strength",
      primaryMuscles: ["Hamstrings", "Glutes"],
      secondaryMuscles: ["Lower back", "Core"],
      equipment: ["Dumbbells", "Barbell"],
      difficulty: "Intermediate",
      instructions: [
        "Stand with the weight in front of your thighs.",
        "Keep a slight bend in your knees.",
        "Push your hips back while lowering the weight along your legs.",
        "Stop when you feel a stretch in your hamstrings.",
        "Drive your hips forward to return to standing."
      ],
      commonMistakes: [
        "Squatting instead of hinging.",
        "Rounding the lower back.",
        "Letting the weight drift away from the body."
      ],
      tips: [
        "Keep the weight close to your legs.",
        "Move from your hips, not your knees."
      ],
      alternatives: ["glute-bridge", "leg-curl"],
      videoUrl: "",
      imageUrl: ""
    },
    {
      id: "plank",
      name: "Plank",
      category: "Core",
      primaryMuscles: ["Core"],
      secondaryMuscles: ["Shoulders", "Glutes"],
      equipment: ["Bodyweight"],
      difficulty: "Beginner",
      instructions: [
        "Start on your forearms and toes.",
        "Keep your elbows under your shoulders.",
        "Brace your core and squeeze your glutes.",
        "Keep your body in a straight line.",
        "Hold without letting your hips sag."
      ],
      commonMistakes: [
        "Letting the hips drop.",
        "Holding the breath.",
        "Raising the hips too high."
      ],
      tips: [
        "Start with shorter holds and build up.",
        "Think about pulling your ribs down toward your hips."
      ],
      alternatives: ["side-plank", "dead-bug"],
      videoUrl: "",
      imageUrl: ""
    },
    {
      id: "bench-press",
      name: "Bench Press",
      category: "Strength",
      primaryMuscles: ["Chest"],
      secondaryMuscles: ["Shoulders", "Triceps"],
      equipment: ["Barbell", "Bench"],
      difficulty: "Intermediate",
      instructions: [
        "Lie on the bench with your eyes under the bar.",
        "Grip the bar slightly wider than shoulder-width.",
        "Lower the bar to your mid-chest with control.",
        "Press the bar back up until your arms are extended.",
        "Keep your feet planted and shoulder blades pulled back."
      ],
      commonMistakes: [
        "Flaring elbows too wide.",
        "Bouncing the bar off the chest.",
        "Lifting the hips off the bench."
      ],
      tips: [
        "Use a spotter for heavy sets.",
        "Keep your wrists straight."
      ],
      alternatives: ["dumbbell-bench-press", "push-up"],
      videoUrl: "",
      imageUrl: ""
    },
    {
      id: "seated-row",
      name: "Seated Row",
      category: "Strength",
      primaryMuscles: ["Back"],
      secondaryMuscles: ["Biceps"],
      equipment: ["Cable machine"],
      difficulty: "Beginner",
      instructions: [
        "Sit at the cable row machine with your feet supported.",
        "Hold the handle with arms extended.",
        "Pull the handle toward your torso.",
        "Squeeze your shoulder blades together.",
        "Return slowly with control."
      ],
      commonMistakes: [
        "Leaning too far back.",
        "Shrugging the shoulders.",
        "Using momentum."
      ],
      tips: [
        "Keep your torso mostly still.",
        "Pull your elbows back, not up."
      ],
      alternatives: ["lat-pulldown", "dumbbell-row"],
      videoUrl: "",
      imageUrl: ""
    },
    {
      id: "shoulder-press",
      name: "Shoulder Press",
      category: "Strength",
      primaryMuscles: ["Shoulders"],
      secondaryMuscles: ["Triceps", "Core"],
      equipment: ["Dumbbells", "Machine", "Barbell"],
      difficulty: "Beginner",
      instructions: [
        "Start with the weight at shoulder height.",
        "Brace your core.",
        "Press the weight overhead until your arms are extended.",
        "Lower back to shoulder height with control.",
        "Avoid leaning too far backward."
      ],
      commonMistakes: [
        "Arching the lower back.",
        "Using too much momentum.",
        "Lowering too fast."
      ],
      tips: [
        "Use a seated version if standing feels unstable.",
        "Keep your ribs down as you press."
      ],
      alternatives: ["machine-shoulder-press", "lateral-raise"],
      videoUrl: "",
      imageUrl: ""
    },
    {
      id: "bicep-curl",
      name: "Bicep Curl",
      category: "Strength",
      primaryMuscles: ["Biceps"],
      secondaryMuscles: ["Forearms"],
      equipment: ["Dumbbells", "Cable", "Barbell"],
      difficulty: "Beginner",
      instructions: [
        "Stand or sit with the weight at your sides.",
        "Keep your elbows close to your body.",
        "Curl the weight up toward your shoulders.",
        "Squeeze your biceps at the top.",
        "Lower with control."
      ],
      commonMistakes: [
        "Swinging the body.",
        "Moving the elbows forward.",
        "Lowering too quickly."
      ],
      tips: [
        "Use lighter weight if you need to swing.",
        "Control both the lifting and lowering."
      ],
      alternatives: ["hammer-curl", "cable-curl"],
      videoUrl: "",
      imageUrl: ""
    },
    {
      id: "squat",
      name: "Squat",
      category: "Strength",
      primaryMuscles: ["Quads", "Glutes"],
      secondaryMuscles: ["Core", "Hamstrings"],
      equipment: ["Barbell", "Bodyweight"],
      difficulty: "Intermediate",
      instructions: [
        "Stand with your feet about shoulder-width apart.",
        "Brace your core before lowering.",
        "Bend your knees and hips to squat down.",
        "Keep your chest up and knees tracking over your toes.",
        "Push through your feet to stand back up."
      ],
      commonMistakes: [
        "Knees collapsing inward.",
        "Rounding the back.",
        "Cutting depth too high without control."
      ],
      tips: [
        "Start with bodyweight or goblet squats if new.",
        "Keep the movement controlled."
      ],
      alternatives: ["goblet-squat", "leg-press"],
      videoUrl: "",
      imageUrl: ""
    },
    {
      id: "leg-press",
      name: "Leg Press",
      category: "Strength",
      primaryMuscles: ["Quads", "Glutes"],
      secondaryMuscles: ["Hamstrings"],
      equipment: ["Machine"],
      difficulty: "Beginner",
      instructions: [
        "Sit on the leg press machine with your back against the pad.",
        "Place your feet on the platform about shoulder-width apart.",
        "Lower the platform with control.",
        "Push through your feet to extend your legs.",
        "Do not lock your knees hard at the top."
      ],
      commonMistakes: [
        "Letting knees cave inward.",
        "Lowering too far and rounding the lower back.",
        "Locking the knees aggressively."
      ],
      tips: [
        "Keep your lower back against the pad.",
        "Use a range of motion you can control."
      ],
      alternatives: ["squat", "goblet-squat"],
      videoUrl: "",
      imageUrl: ""
    },
    {
      id: "hamstring-curl",
      name: "Hamstring Curl",
      category: "Strength",
      primaryMuscles: ["Hamstrings"],
      secondaryMuscles: [],
      equipment: ["Machine"],
      difficulty: "Beginner",
      instructions: [
        "Set up on the hamstring curl machine.",
        "Adjust the pad so it rests near your lower legs.",
        "Curl your heels toward your glutes.",
        "Pause briefly at the top.",
        "Lower slowly with control."
      ],
      commonMistakes: [
        "Using momentum.",
        "Lifting the hips off the pad.",
        "Letting the weight stack slam."
      ],
      tips: [
        "Control the lowering phase.",
        "Use a full but comfortable range of motion."
      ],
      alternatives: ["romanian-deadlift", "glute-bridge"],
      videoUrl: "",
      imageUrl: ""
    },
    {
      id: "calf-raise",
      name: "Calf Raise",
      category: "Strength",
      primaryMuscles: ["Calves"],
      secondaryMuscles: [],
      equipment: ["Machine", "Dumbbells", "Bodyweight"],
      difficulty: "Beginner",
      instructions: [
        "Stand with your feet about hip-width apart.",
        "Raise your heels as high as comfortable.",
        "Pause briefly at the top.",
        "Lower your heels with control.",
        "Repeat without bouncing."
      ],
      commonMistakes: [
        "Bouncing through reps.",
        "Using too short a range of motion.",
        "Leaning too much."
      ],
      tips: [
        "Pause at the top and bottom.",
        "Use slow controlled reps."
      ],
      alternatives: ["seated-calf-raise"],
      videoUrl: "",
      imageUrl: ""
    },
    {
      id: "hip-thrust",
      name: "Hip Thrust",
      category: "Strength",
      primaryMuscles: ["Glutes"],
      secondaryMuscles: ["Hamstrings", "Core"],
      equipment: ["Bench", "Barbell", "Machine"],
      difficulty: "Intermediate",
      instructions: [
        "Sit on the floor with your upper back against a bench.",
        "Place the weight across your hips if using one.",
        "Plant your feet firmly on the floor.",
        "Drive through your heels and lift your hips.",
        "Squeeze your glutes at the top, then lower with control."
      ],
      commonMistakes: [
        "Overarching the lower back.",
        "Pushing through the toes.",
        "Not fully extending the hips."
      ],
      tips: [
        "Keep your chin slightly tucked.",
        "Pause briefly at the top of each rep."
      ],
      alternatives: ["glute-bridge", "cable-kickback"],
      videoUrl: "",
      imageUrl: ""
    },
    {
      id: "walking-lunge",
      name: "Walking Lunge",
      category: "Strength",
      primaryMuscles: ["Quads", "Glutes"],
      secondaryMuscles: ["Hamstrings", "Core"],
      equipment: ["Bodyweight", "Dumbbells"],
      difficulty: "Intermediate",
      instructions: [
        "Stand tall with your feet together.",
        "Step forward into a lunge.",
        "Lower until both knees are bent comfortably.",
        "Push through the front foot to step forward.",
        "Alternate legs with each step."
      ],
      commonMistakes: [
        "Taking steps that are too short.",
        "Letting the front knee cave inward.",
        "Leaning forward too much."
      ],
      tips: [
        "Move slowly and stay balanced.",
        "Start with bodyweight before adding dumbbells."
      ],
      alternatives: ["split-squat", "leg-press"],
      videoUrl: "",
      imageUrl: ""
    },
    {
      id: "cable-kickback",
      name: "Cable Kickback",
      category: "Strength",
      primaryMuscles: ["Glutes"],
      secondaryMuscles: ["Hamstrings"],
      equipment: ["Cable machine"],
      difficulty: "Beginner",
      instructions: [
        "Attach an ankle strap to a low cable.",
        "Stand facing the machine and hold it for support.",
        "Kick one leg back while keeping your torso stable.",
        "Squeeze your glute at the top.",
        "Return slowly and repeat."
      ],
      commonMistakes: [
        "Arching the lower back.",
        "Swinging the leg.",
        "Turning the movement into a lower-back exercise."
      ],
      tips: [
        "Use a light weight and focus on control.",
        "Keep your hips square."
      ],
      alternatives: ["glute-bridge", "hip-thrust"],
      videoUrl: "",
      imageUrl: ""
    },
    {
      id: "bulgarian-split-squat",
      name: "Bulgarian Split Squat",
      category: "Strength",
      primaryMuscles: ["Quads", "Glutes"],
      secondaryMuscles: ["Hamstrings", "Core"],
      equipment: ["Bench", "Dumbbells", "Bodyweight"],
      difficulty: "Intermediate",
      instructions: [
        "Stand a few feet in front of a bench.",
        "Place one foot behind you on the bench.",
        "Lower your body by bending the front knee.",
        "Keep your torso controlled.",
        "Push through the front foot to stand back up."
      ],
      commonMistakes: [
        "Standing too close to the bench.",
        "Losing balance by rushing reps.",
        "Letting the front knee cave inward."
      ],
      tips: [
        "Start with bodyweight.",
        "Hold onto support if balance is difficult."
      ],
      alternatives: ["walking-lunge", "leg-press"],
      videoUrl: "",
      imageUrl: ""
    },
    {
      id: "ab-crunch-machine",
      name: "Ab Crunch Machine",
      category: "Core",
      primaryMuscles: ["Core"],
      secondaryMuscles: [],
      equipment: ["Machine"],
      difficulty: "Beginner",
      instructions: [
        "Sit in the crunch machine and adjust the pads.",
        "Brace your core.",
        "Crunch down by bringing your ribs toward your hips.",
        "Pause briefly.",
        "Return slowly to the starting position."
      ],
      commonMistakes: [
        "Pulling with the arms.",
        "Using too much weight.",
        "Moving too quickly."
      ],
      tips: [
        "Focus on your abs doing the movement.",
        "Use controlled reps."
      ],
      alternatives: ["plank", "cable-crunch"],
      videoUrl: "",
      imageUrl: ""
    },
    {
      id: "side-plank",
      name: "Side Plank",
      category: "Core",
      primaryMuscles: ["Obliques", "Core"],
      secondaryMuscles: ["Shoulders", "Glutes"],
      equipment: ["Bodyweight"],
      difficulty: "Beginner",
      instructions: [
        "Lie on your side with your forearm under your shoulder.",
        "Stack your feet or stagger them for balance.",
        "Lift your hips off the floor.",
        "Keep your body in a straight line.",
        "Hold, then switch sides."
      ],
      commonMistakes: [
        "Letting the hips sag.",
        "Rotating the chest toward the floor.",
        "Holding the breath."
      ],
      tips: [
        "Start with knees bent if needed.",
        "Keep your core tight."
      ],
      alternatives: ["plank", "dead-bug"],
      videoUrl: "",
      imageUrl: ""
    }
  ];