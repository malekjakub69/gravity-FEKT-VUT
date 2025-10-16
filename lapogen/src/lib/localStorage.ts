import type { AppData } from "../App";

const STORAGE_KEYS = {
  APP_DATA: "lapogenAppData",
} as const;

// Save app data to localStorage
export function saveAppData(data?: AppData): void {
  if (!data) return;
  try {
    localStorage.setItem(STORAGE_KEYS.APP_DATA, JSON.stringify(data));
  } catch (error) {
    console.error("Failed to save app data to localStorage:", error);
  }
}

// Load app data from localStorage
export function loadAppData(): AppData | null {
  try {
    const stored = localStorage.getItem(STORAGE_KEYS.APP_DATA);
    if (stored) {
      return JSON.parse(stored) as AppData;
    }
  } catch (error) {
    console.error("Failed to load app data from localStorage:", error);
  }
  return null;
}

// Clear all app data from localStorage
export function clearAppData(): void {
  try {
    localStorage.removeItem(STORAGE_KEYS.APP_DATA);
  } catch (error) {
    console.error("Failed to clear app data from localStorage:", error);
  }
}

// Check if localStorage is available
export function isLocalStorageAvailable(): boolean {
  try {
    const test = "__localStorage_test__";
    localStorage.setItem(test, test);
    localStorage.removeItem(test);
    return true;
  } catch {
    return false;
  }
}
