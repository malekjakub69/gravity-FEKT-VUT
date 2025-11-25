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

// Encoding helpers for compact export URLs
// Convert binary data to URL-safe base64 (base64url) without padding
function toBase64Url(bytes: Uint8Array): string {
  const binary = Array.from(bytes)
    .map((b) => String.fromCharCode(b))
    .join("");
  // btoa expects binary string; replace to URL-safe variant
  return btoa(binary)
    .replace(/\+/g, "-")
    .replace(/\//g, "_")
    .replace(/=+$/g, "");
}

function fromBase64Url(base64url: string): Uint8Array {
  const base64 = base64url.replace(/-/g, "+").replace(/_/g, "/");
  // restore padding
  const padding = base64.length % 4 === 0 ? 0 : 4 - (base64.length % 4);
  const padded = base64 + "=".repeat(padding);
  const binary = atob(padded);
  const bytes = new Uint8Array(binary.length);
  for (let i = 0; i < binary.length; i++) {
    bytes[i] = binary.charCodeAt(i);
  }
  return bytes;
}

// Encode JSON string to base64url
export function encodeJsonToBase64Url(json: string): string {
  const inputBytes = new TextEncoder().encode(json);
  return toBase64Url(inputBytes);
}

// Decode base64url back to JSON string
export function decodeBase64UrlToJson(base64url: string): string {
  const bytes = fromBase64Url(base64url);
  return new TextDecoder().decode(bytes);
}
