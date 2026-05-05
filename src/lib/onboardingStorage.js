const STORAGE_KEY = "gym_onboarding";

export function getOnboardingData() {
  if (typeof window === "undefined") return {};

  const saved = localStorage.getItem(STORAGE_KEY);

  if (!saved) return {};

  try {
    return JSON.parse(saved);
  } catch {
    return {};
  }
}

export function saveOnboardingData(newData) {
  if (typeof window === "undefined") return;

  const currentData = getOnboardingData();
  const currentVersion = currentData.version || 0;

  const updatedData = {
    ...currentData,
    ...newData,
    version: currentVersion + 1,
    updatedAt: new Date().toISOString(),
  };

  localStorage.setItem(STORAGE_KEY, JSON.stringify(updatedData));
}